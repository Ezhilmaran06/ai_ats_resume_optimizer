import re
import hashlib
from typing import Dict, Any, List, Optional
from app.services.resume_parser import parse_resume_document
from app.services.role_analyzer import analyze_job_description, format_skill_name
from app.services.keyword_engine import extract_all_resume_tokens, find_semantic_match, SEMANTIC_CLUSTERS
from app.services.semantic_matcher import perform_resume_role_matching, evaluate_semantic_skill_match
from app.services.nlp_analyzer import (
    detect_metrics,
    detect_action_verbs_and_weaknesses,
    audit_professional_language,
    extract_all_resume_bullets
)
from app.services.ats_engine import (
    analyze_machine_readability,
    analyze_resume_structure,
    analyze_skills_and_keyword_quality,
    analyze_formatting_and_ats_safety
)
from app.schemas.analyze_schema import (
    AnalyzeResponse,
    ScoreBreakdown,
    MissingKeywordItem,
    RecommendedKeywordItem,
    SemanticMatchItem,
    ProblemItem,
    RecommendationItem,
    SuggestedRewrite
)

def run_ats_analysis(resume_bytes: bytes, filename: str, job_description: str) -> AnalyzeResponse:
    """
    Executes end-to-end 9-step AI ATS analysis pipeline:
    1. Parse resume file
    2. Extract resume sections, skills, experience, projects
    3. Analyze Job Description
    4. Perform semantic matching
    5. Calculate 8-dimension ATS score (0-100)
    6. Generate matched, missing, and recommended keywords with anti-fabrication policy
    7. Detect dynamic resume problems & actionable recommendations with suggested rewrites
    8. Build resume and job summaries
    9. Validate with Pydantic and return strict response
    """
    # Validation
    if not resume_bytes or len(resume_bytes) == 0:
        raise ValueError("No resume file uploaded or file is empty.")

    if not job_description or len(job_description.strip()) < 30:
        raise ValueError("Job description is too short. Please provide a complete job description with at least 30 characters.")

    # Step 1 & 2: Parse resume
    parsed = parse_resume_document(resume_bytes, filename)
    raw_text = parsed["rawText"]
    structured = parsed["structured"]
    resume = parsed["resume"]
    resume_tokens = extract_all_resume_tokens(resume)
    resume_tokens_lower = (resume_tokens + " " + raw_text).lower()

    # Step 3: Analyze Job Description
    role_analysis = analyze_job_description(role_title="", description=job_description)
    required_skills = role_analysis.get("requiredSkills", [])
    preferred_skills = role_analysis.get("preferredSkills", [])
    all_jd_skills = list(dict.fromkeys(required_skills + preferred_skills))
    responsibilities = role_analysis.get("responsibilities", [])
    experience_reqs = role_analysis.get("experience", [])
    edu_reqs = role_analysis.get("education", [])
    target_role_title = role_analysis.get("role", "Software Engineer")

    # Step 4: Semantic Matching
    match_result = perform_resume_role_matching(resume, {
        "extractedSkills": [{"name": s} for s in all_jd_skills],
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills
    })

    # Step 5 & 6: Keywords & Semantic Matches
    matched_keywords_list: List[str] = []
    missing_keywords_list: List[MissingKeywordItem] = []
    recommended_keywords_list: List[RecommendedKeywordItem] = []
    semantic_matches_list: List[SemanticMatchItem] = []

    # Identify confirmed verified technologies in resume
    verified_resume_skills = set()
    for s in resume.get("skills", []):
        if isinstance(s, dict):
            verified_resume_skills.add(s.get("name", "").lower())
        else:
            verified_resume_skills.add(str(s).lower())
    for p in resume.get("projects", []):
        for t in p.get("technologies", []):
            verified_resume_skills.add(str(t).lower())

    for skill in all_jd_skills:
        status, match_type, matched_with, explanation = evaluate_semantic_skill_match(
            skill, resume_tokens, resume
        )

        is_required = skill in required_skills
        importance_level = "HIGH" if is_required else "MEDIUM"

        if status == "MATCHED":
            matched_keywords_list.append(skill)
            semantic_matches_list.append(SemanticMatchItem(
                requirement=skill,
                resume_match=matched_with or skill,
                match_type="Strong Match",
                explanation=explanation
            ))
        elif status == "PARTIAL":
            matched_keywords_list.append(skill)
            semantic_matches_list.append(SemanticMatchItem(
                requirement=skill,
                resume_match=matched_with or skill,
                match_type="Partial Match",
                explanation=explanation
            ))
        else:
            # MISSING KEYWORD
            # Check if advanced skill with zero evidence (risky/unsupported)
            is_risky = not any(
                part in resume_tokens_lower
                for part in re.split(r'[\s\-_/]+', skill.lower())
                if len(part) > 2
            )

            reason_msg = (
                f"Listed as a {'required' if is_required else 'preferred'} competency in the job description but not detected in the resume. "
                f"If you have genuine experience with {skill}, consider adding it to your Skills or Projects section with supporting evidence."
            )

            missing_item = MissingKeywordItem(
                keyword=skill,
                importance=importance_level,
                reason=reason_msg,
                risky=is_risky
            )
            missing_keywords_list.append(missing_item)

            semantic_matches_list.append(SemanticMatchItem(
                requirement=skill,
                resume_match="Not found",
                match_type="Missing",
                explanation=f"Requirement '{skill}' is not evidenced in the resume."
            ))

            # Recommended keywords: high and medium importance missing items
            recommended_keywords_list.append(RecommendedKeywordItem(
                keyword=skill,
                importance=importance_level,
                reason=f"{'Core requirement' if is_required else 'Valuable qualification'} for {target_role_title} role."
            ))

    # Deduplicate matched keywords
    matched_keywords_list = list(dict.fromkeys(matched_keywords_list))

    # Step 7: ATS Dimension Scoring (Sum to 100)
    # Dimension 1: ATS Readability (Max 15)
    readability_eval = analyze_machine_readability(resume, raw_text)
    dim_readability = max(2, min(15, readability_eval.get("score", 12)))

    # Dimension 2: Resume Structure (Max 15)
    structure_eval = analyze_resume_structure(resume)
    dim_structure = max(2, min(15, structure_eval.get("score", 12)))

    # Dimension 3: Keyword Coverage (Max 20)
    total_jd_keywords = max(1, len(all_jd_skills))
    matched_count = len([k for k in all_jd_skills if k in matched_keywords_list])
    # Weight required higher than preferred
    req_total = max(1, len(required_skills))
    req_matched = len([k for k in required_skills if k in matched_keywords_list])
    pref_total = max(1, len(preferred_skills))
    pref_matched = len([k for k in preferred_skills if k in matched_keywords_list])

    if len(all_jd_skills) > 0:
        req_ratio = req_matched / req_total
        pref_ratio = pref_matched / pref_total if preferred_skills else 1.0
        kw_ratio = (req_ratio * 0.7) + (pref_ratio * 0.3)
        dim_keyword_coverage = int(round(kw_ratio * 20))
    else:
        dim_keyword_coverage = 14
    dim_keyword_coverage = max(1, min(20, dim_keyword_coverage))

    # Dimension 4: Skills Match (Max 15)
    match_pct = match_result.get("matchPercentage", 60)
    dim_skills_match = int(round((match_pct / 100.0) * 15))
    dim_skills_match = max(1, min(15, dim_skills_match))

    # Dimension 5: Experience Relevance (Max 10)
    experience_list = resume.get("experience", [])
    dim_experience = 0
    if len(experience_list) >= 3:
        dim_experience += 4
    elif len(experience_list) >= 1:
        dim_experience += 3
    else:
        dim_experience += 1

    # Check for relevant keywords in experience highlights
    exp_bullets = []
    for e in experience_list:
        for h in e.get("highlights", []):
            exp_bullets.append(h)
    exp_text = " ".join(exp_bullets).lower()
    exp_kw_matches = sum(1 for k in all_jd_skills if k.lower() in exp_text)
    if exp_kw_matches >= 4:
        dim_experience += 4
    elif exp_kw_matches >= 2:
        dim_experience += 3
    elif exp_kw_matches >= 1:
        dim_experience += 2
    else:
        dim_experience += 1

    # Check for experience length / metrics in work history
    if len(detect_metrics(exp_text)) >= 2:
        dim_experience += 2
    else:
        dim_experience += 1
    dim_experience = max(1, min(10, dim_experience))

    # Dimension 6: Project Relevance (Max 10)
    projects_list = resume.get("projects", [])
    dim_projects = 0
    if len(projects_list) >= 3:
        dim_projects += 4
    elif len(projects_list) >= 1:
        dim_projects += 3
    else:
        dim_projects += 1

    proj_bullets = []
    for p in projects_list:
        proj_bullets.extend(p.get("highlights", []))
        if p.get("description"):
            proj_bullets.append(p.get("description"))
    proj_text = " ".join(proj_bullets).lower()
    proj_kw_matches = sum(1 for k in all_jd_skills if k.lower() in proj_text)
    if proj_kw_matches >= 3:
        dim_projects += 4
    elif proj_kw_matches >= 1:
        dim_projects += 3
    else:
        dim_projects += 1

    if any(p.get("technologies") for p in projects_list):
        dim_projects += 2
    else:
        dim_projects += 1
    dim_projects = max(1, min(10, dim_projects))

    # Dimension 7: Job Alignment (Max 10)
    # Check responsibilities & qualifications alignment
    dim_alignment = 0
    bullets_all = extract_all_resume_bullets(resume)
    bullets_text = " ".join(bullets_all).lower()

    # Responsibility overlap
    resp_overlap = 0
    for r in responsibilities[:5]:
        r_words = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', r.lower()) if w not in {"with", "that", "this", "from", "have", "will"}]
        if any(w in bullets_text for w in r_words):
            resp_overlap += 1
    if resp_overlap >= 3:
        dim_alignment += 5
    elif resp_overlap >= 1:
        dim_alignment += 3
    else:
        dim_alignment += 1

    # Education / degree check
    if edu_reqs and resume.get("education"):
        dim_alignment += 3
    elif resume.get("education"):
        dim_alignment += 2
    else:
        dim_alignment += 1

    # Career stage / role title relevance
    summary_text = resume.get("summary", "").lower()
    title_words = [w for w in target_role_title.lower().split() if len(w) > 3]
    if any(w in summary_text or w in bullets_text for w in title_words):
        dim_alignment += 2
    else:
        dim_alignment += 1
    dim_alignment = max(1, min(10, dim_alignment))

    # Dimension 8: Professional Language (Max 5)
    lang_audit = audit_professional_language(resume)
    verb_audit = detect_action_verbs_and_weaknesses(bullets_all)
    dim_language = 0
    if verb_audit["strongRatio"] >= 0.7:
        dim_language += 2
    elif verb_audit["strongRatio"] >= 0.4:
        dim_language += 1
    else:
        dim_language += 0

    weak_phrases = verb_audit.get("weakPhrasesFound", [])
    if len(weak_phrases) == 0:
        dim_language += 2
    elif len(weak_phrases) <= 2:
        dim_language += 1
    else:
        dim_language += 0

    if lang_audit.get("firstPersonCount", 0) == 0:
        dim_language += 1
    else:
        dim_language += 0
    dim_language = max(1, min(5, dim_language))

    # Final Total ATS Score
    total_ats_score = (
        dim_readability +
        dim_structure +
        dim_keyword_coverage +
        dim_skills_match +
        dim_experience +
        dim_projects +
        dim_alignment +
        dim_language
    )
    total_ats_score = max(0, min(100, total_ats_score))

    score_breakdown = ScoreBreakdown(
        ats_readability=dim_readability,
        structure=dim_structure,
        keyword_coverage=dim_keyword_coverage,
        skills_match=dim_skills_match,
        experience_relevance=dim_experience,
        project_relevance=dim_projects,
        job_alignment=dim_alignment,
        professional_language=dim_language
    )

    # Step 8: Resume Problems (Why Your Resume Is Losing Points)
    problems_list: List[ProblemItem] = []

    # Problem 1: Missing keywords
    high_missing = [m.keyword for m in missing_keywords_list if m.importance == "HIGH"]
    if high_missing:
        sample_str = ", ".join(high_missing[:4])
        problems_list.append(ProblemItem(
            title=f"Core Required Keywords Missing ({sample_str})",
            description=f"The job description explicitly prioritizes {sample_str}, but these were not found in your resume. ATS filters heavily screen candidates on these exact competencies.",
            severity="HIGH"
        ))

    # Problem 2: Quantifiable metrics
    all_metrics = detect_metrics(bullets_text)
    if len(all_metrics) == 0:
        problems_list.append(ProblemItem(
            title="Zero Measurable Impact Metrics Detected",
            description="Bullet points focus on duties rather than quantifiable outcomes (e.g. percentages, scale, latency reductions, or team size). Resumes with measurable impact score significantly higher in ATS evaluation.",
            severity="HIGH"
        ))
    elif len(all_metrics) < 3:
        problems_list.append(ProblemItem(
            title="Low Frequency of Quantifiable Achievements",
            description=f"Only {len(all_metrics)} numeric metrics were found across your bullets. Adding concrete performance numbers strengthens ATS ranking.",
            severity="MEDIUM"
        ))

    # Problem 3: Passive verbs or weak language
    if len(weak_phrases) > 0:
        sample_weak = ", ".join(weak_phrases[:3])
        problems_list.append(ProblemItem(
            title="Passive or Task-Based Language Used",
            description=f"Detected passive expressions such as '{sample_weak}'. ATS scoring favors active past-tense leadership verbs (e.g., 'Architected', 'Engineered', 'Optimized').",
            severity="MEDIUM"
        ))

    # Problem 4: Formatting hazards
    fmt_eval = analyze_formatting_and_ats_safety(resume, raw_text)
    if fmt_eval.get("score", 10) < 8:
        for iss in fmt_eval.get("issues", []):
            problems_list.append(ProblemItem(
                title=iss.get("title", "Potential ATS Layout Hazard"),
                description=iss.get("description", "Non-linear formatting or complex symbols may hinder ATS text extraction."),
                severity="HIGH" if "severe" in iss.get("id", "") else "MEDIUM"
            ))

    # Problem 5: Skills without project evidence
    context_audit = analyze_skills_and_keyword_quality(resume)
    if context_audit.get("score", 15) < 10:
        for iss in context_audit.get("issues", []):
            problems_list.append(ProblemItem(
                title=iss.get("title", "Skills Not Backed by Projects"),
                description=iss.get("description", "Listing skills without referencing them in your project or work history reduces semantic weight."),
                severity="MEDIUM"
            ))

    # Problem 6: Summary section
    summary_len = len(resume.get("summary", "").split())
    if summary_len < 15:
        problems_list.append(ProblemItem(
            title="Missing or Terse Professional Summary",
            description="A 2–3 sentence executive summary introduces your core tech stack and primes ATS parsers for the target role.",
            severity="LOW"
        ))

    # If no problems detected, add a standard refinement note
    if not problems_list:
        problems_list.append(ProblemItem(
            title="Minor Keyword Expansion Opportunity",
            description="Resume structure and readability are solid; adding secondary tools mentioned in the job description can maximize alignment.",
            severity="LOW"
        ))

    # Step 9: Actionable Recommendations & Suggested Rewrites (Anti-Fabrication)
    recommendations_list: List[RecommendationItem] = []

    # Priority 1: Missing keywords where truthful
    if high_missing:
        sample_missing = ", ".join(high_missing[:3])
        recommendations_list.append(RecommendationItem(
            priority="Priority 1",
            title="Incorporate Verified Missing Keywords Where Truthful",
            reason="ATS algorithms use keyword density and placement to rank candidates. Missing required terms causes immediate score loss.",
            suggestion=(
                f"Review the missing keywords ({sample_missing}). "
                "If you possess genuine experience with any of these technologies, document them in your Skills section and describe concrete projects where you utilized them. "
                "Do NOT add technologies you have not worked with."
            )
        ))
    else:
        recommendations_list.append(RecommendationItem(
            priority="Priority 1",
            title="Maintain High Keyword Density in Core Sections",
            reason="Your resume covers the primary job requirements well.",
            suggestion="Ensure target technologies appear in both the Skills matrix and within project bullet points for maximum semantic confirmation."
        ))

    # Priority 2: Quantifiable metrics
    recommendations_list.append(RecommendationItem(
        priority="Priority 2",
        title="Add Quantifiable Results to Experience and Projects",
        reason="Modern ATS models and recruiters prioritize candidates demonstrating measurable business and technical impact.",
        suggestion="Follow the Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. For example, quantify performance gains, user base, or error reduction."
    ))

    # Priority 3: Lead with strong power action verbs
    recommendations_list.append(RecommendationItem(
        priority="Priority 3",
        title="Lead Every Accomplishment Bullet with Strong Action Verbs",
        reason="Action verbs like 'Architected', 'Implemented', and 'Optimized' demonstrate assertiveness and clear technical ownership.",
        suggestion="Replace passive openings like 'Responsible for' or 'Worked on' with decisive past-tense verbs."
    ))

    # Priority 4: Suggested Rewrite without hallucination
    # Find a real bullet point in the resume to demonstrate an ATS-optimized rewrite
    rewrite_obj: Optional[SuggestedRewrite] = None
    all_bullets = extract_all_resume_bullets(resume)
    for b in all_bullets:
        b_clean = b.strip()
        if 15 < len(b_clean) < 140:
            # Check if starts with a weak phrase or lacks numbers
            has_weak = any(p in b_clean.lower() for p in ["helped", "responsible for", "worked on", "assisted", "developed a", "created a", "built a"])
            if has_weak or len(detect_metrics(b_clean)) == 0:
                # Build an honest rewrite using ONLY candidate verified skills
                verified_sample = [s.title() for s in list(verified_resume_skills)[:3] if len(s) > 2]
                tech_phrase = f" using {', '.join(verified_sample)}" if verified_sample else ""
                
                # Make strong verb
                improved = re.sub(r'^(?:Responsible for|Worked on|Helped with|Assisted with|Created a|Developed a|Built a|Engineered|Architected|Implemented)\s*(?:a|an|the)?\s*', '', b_clean, flags=re.I).strip()
                if improved:
                    suggested_text = f"Architected and deployed {improved[:1].lower() + improved[1:]}{tech_phrase}, ensuring high reliability, measurable performance impact, and ATS keyword coverage."
                else:
                    suggested_text = f"Engineered scalable solution{tech_phrase}, optimizing performance and system reliability."

                rewrite_obj = SuggestedRewrite(
                    section="Projects / Experience",
                    current=b_clean,
                    suggested=suggested_text,
                    label="Suggested Rewrite",
                    reason="Replaces basic task description with an active power verb and emphasizes verified technical stack without fabricating unverified claims."
                )
                break

    recommendations_list.append(RecommendationItem(
        priority="Priority 4",
        title="Elevate Project Bullet Specificity",
        reason="ATS parsers assign higher relevance to project descriptions that link actions directly to technology stacks.",
        suggestion="Specify frameworks, databases, and APIs used in each project.",
        suggested_rewrite=rewrite_obj
    ))

    # Priority 5: Single-stream layout and clean section headers
    recommendations_list.append(RecommendationItem(
        priority="Priority 5",
        title="Maintain a Linear, Single-Column ATS Layout",
        reason="Multi-column tables and decorative graphics frequently cause text reordering and token drop during automated ATS ingestion.",
        suggestion="Use standard section headings (Summary, Experience, Projects, Education, Skills) and avoid multi-column tables or icons."
    ))

    # Step 10: Summaries & Confidence
    contact = resume.get("personalInfo", {})
    raw_name = contact.get("fullName", "")
    if not raw_name or raw_name.upper() in {"SUMMARY", "OBJECTIVE", "PROFILE", "EDUCATION", "EXPERIENCE", "SKILLS", "CANDIDATE NAME"}:
        name = "Candidate"
    else:
        name = raw_name

    skills_preview = ", ".join(list(verified_resume_skills)[:6]) if verified_resume_skills else "General technical skills"
    exp_count = len(experience_list)
    proj_count = len(projects_list)
    resume_summary = f"{name} | Profile includes {exp_count} experience record(s) and {proj_count} project(s). Core competencies: {skills_preview}."

    job_skills_preview = ", ".join(all_jd_skills[:6]) if all_jd_skills else "General engineering skills"
    job_summary = f"Target Role: {target_role_title} | Key requirements identified: {job_skills_preview}. Total competencies analyzed: {len(all_jd_skills)}."

    # Confidence calculation: based on document length and structure
    confidence = 84
    if len(raw_text) > 1000:
        confidence += 5
    if len(bullets_all) >= 4:
        confidence += 4
    if len(all_jd_skills) >= 4:
        confidence += 4
    confidence = max(75, min(97, confidence))

    return AnalyzeResponse(
        ats_score=total_ats_score,
        score_breakdown=score_breakdown,
        matched_keywords=matched_keywords_list,
        missing_keywords=missing_keywords_list,
        recommended_keywords=recommended_keywords_list,
        semantic_matches=semantic_matches_list,
        problems=problems_list,
        recommendations=recommendations_list,
        resume_summary=resume_summary,
        job_summary=job_summary,
        confidence=confidence
    )
