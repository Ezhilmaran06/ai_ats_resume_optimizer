"""
Two-Layer ATS Scoring Engine for AI ATS Resume Optimizer.

Architecture:
  Layer 1: Deterministic ATS Engine (Readability, Structure, Completeness, Keywords, Formatting)
  Layer 2: AI / NLP Semantic Evaluator (Content Quality, Project Depth, Professional Language)
  Validation Layer: Reconciles signals, computes Confidence, Top 5 Improvements, and Caches results.

Call this result: ATS Compatibility Score.
"""

import re
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.config.scoring_config import (
    RUBRIC_WEIGHTS,
    CALIBRATION_BANDS,
    POWER_ACTION_VERBS,
    WEAK_PASSIVE_PHRASES,
    FORMATTING_HAZARDS
)
from app.services.nlp_analyzer import (
    detect_metrics,
    detect_career_stage,
    analyze_skill_contextual_verification,
    audit_professional_language,
    extract_all_resume_bullets
)
from app.services.ai_semantic_evaluator import (
    evaluate_semantic_locally,
    evaluate_semantic_with_llm
)

# In-memory LRU-style cache for diagnostic reports
ANALYSIS_CACHE: Dict[str, Dict[str, Any]] = {}

def compute_cache_key(resume: Dict[str, Any], role_data: Optional[Dict[str, Any]] = None) -> str:
    """Generate deterministic hash based on resume text, role, and rubric weights."""
    hash_obj = hashlib.sha256()
    raw_str = json.dumps(resume, sort_keys=True, default=str)
    hash_obj.update(raw_str.encode('utf-8'))
    if role_data:
        role_str = json.dumps(role_data, sort_keys=True, default=str)
        hash_obj.update(role_str.encode('utf-8'))
    hash_obj.update(str(RUBRIC_WEIGHTS).encode('utf-8'))
    return hash_obj.hexdigest()

# =============================================================================
# LAYER 1: DETERMINISTIC CATEGORY ANALYZERS
# =============================================================================

def analyze_machine_readability(resume: Dict[str, Any], raw_text: str = "") -> Dict[str, Any]:
    """
    1. Machine Readability (Max 15 points)
    Evaluates text extractability, unicode cleanliness, broken words, and contact fields.
    Score: Poor (0–7), Moderate (8–12), Good (13–15).
    """
    max_score = RUBRIC_WEIGHTS["machineReadability"] # 15
    score = 0
    feedback = []
    issues = []

    text_to_check = raw_text or str(resume)
    char_count = len(text_to_check)
    word_count = len(text_to_check.split())

    # Signal 1.1: Text Density & Ratio (0 to 5 pts)
    if word_count >= 250 and char_count >= 1200:
        score += 5
        feedback.append("Excellent machine text extractability with healthy character density.")
    elif word_count >= 120:
        score += 3
        feedback.append("Acceptable text extractability; document length is slightly brief.")
    else:
        score += 1
        issues.append({
            "id": "mr-low-text",
            "section": "formatting",
            "title": "Insufficient extractable text",
            "description": f"Only {word_count} words extracted. Software parsers require substantive plain text.",
            "suggestion": "Ensure resume is text-searchable (not scanned or image-based) and exceeds 300 words."
        })

    # Signal 1.2: Clean Character Encoding & Absence of Non-Standard Symbols (0 to 5 pts)
    non_ascii_chars = re.findall(r'[^\x00-\x7F\u2022\u2013\u2014\u2018\u2019\u201C\u201D]', text_to_check)
    non_ascii_count = len(non_ascii_chars)
    if non_ascii_count == 0:
        score += 5
        feedback.append("Standard ASCII / UTF-8 character encoding with zero corrupt glyphs.")
    elif non_ascii_count <= 10:
        score += 3
        feedback.append("Minor non-standard symbols detected; easily parsed by modern systems.")
    else:
        score += 1
        issues.append({
            "id": "mr-symbols",
            "section": "formatting",
            "title": f"Unusual symbols detected ({non_ascii_count} non-standard glyphs)",
            "description": "Non-standard bullets, icons, or decorative fonts can break text streams in legacy ATS parsers.",
            "suggestion": "Replace graphical icons and fancy bullets with standard round bullets (•) or hyphens."
        })

    # Signal 1.3: Contact Extraction Quality (0 to 5 pts)
    p = resume.get("personalInfo") or resume.get("personal") or {}
    email_valid = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', p.get("email", "")))
    phone_valid = bool(p.get("phone") and len(str(p.get("phone")).strip()) >= 7)
    loc_valid = bool(p.get("location") and len(str(p.get("location")).strip()) >= 2)
    links_valid = bool(p.get("linkedin") or p.get("github") or resume.get("links"))

    contact_fields_found = sum([email_valid, phone_valid, loc_valid, links_valid])
    if contact_fields_found == 4:
        score += 5
        feedback.append("Header contact data (email, phone, location, links) successfully parsed.")
    elif contact_fields_found == 3:
        score += 4
        missing = "location" if not loc_valid else ("links" if not links_valid else "phone")
        feedback.append(f"Contact header parsed with minor omission: missing {missing}.")
    elif contact_fields_found >= 2:
        score += 2
        issues.append({
            "id": "mr-contact-gap",
            "section": "contact",
            "title": "Incomplete contact information header",
            "description": "ATS algorithms require unambiguous email, phone, location, and professional links.",
            "suggestion": "Place email, phone number, city/state, and LinkedIn profile at the top of your resume."
        })
    else:
        score += 0
        issues.append({
            "id": "mr-contact-missing",
            "section": "contact",
            "title": "Critical contact fields missing from header",
            "description": "Could not identify standard candidate contact information in parsed document header.",
            "suggestion": "Add candidate name, verified email address, phone number, and location at the very top."
        })

    score = min(max_score, max(1, score))

    return {
        "name": "Machine Readability",
        "score": score,
        "maxScore": max_score,
        "status": "Good" if score >= 12 else ("Moderate" if score >= 8 else "Needs Improvement"),
        "feedback": " ".join(feedback),
        "issues": issues
    }

def analyze_resume_structure(resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    2. Resume Structure (Max 15 points)
    Evaluates logical hierarchy, linear section flow, and career-stage appropriateness.
    """
    max_score = RUBRIC_WEIGHTS["resumeStructure"] # 15
    score = 0
    feedback = []
    issues = []

    career_stage = detect_career_stage(resume)
    sections_present = []

    if resume.get("personalInfo") or resume.get("personal"): sections_present.append("Contact Info")
    if resume.get("summary"): sections_present.append("Summary")
    if resume.get("skills"): sections_present.append("Skills")
    if resume.get("education") and len(resume.get("education")) > 0: sections_present.append("Education")
    if resume.get("experience") and len(resume.get("experience")) > 0: sections_present.append("Experience")
    if resume.get("projects") and len(resume.get("projects")) > 0: sections_present.append("Projects")

    # Anti-Penalty for Students/Freshers: Projects count as core experience
    if career_stage == "FRESHER":
        core_count = len(sections_present)
        # Freshers need Contact + Education + Skills + (Projects or Experience)
        has_academic = "Education" in sections_present
        has_skills = "Skills" in sections_present
        has_hands_on = "Projects" in sections_present or "Experience" in sections_present

        if has_academic and has_skills and has_hands_on:
            if core_count >= 5:
                score += 15
                feedback.append(f"Well-structured entry-level resume hierarchy ({', '.join(sections_present)}).")
            elif core_count >= 4:
                score += 12
                feedback.append("Solid section structure. Adding an executive summary or projects section will complete the layout.")
            else:
                score += 9
        else:
            score += 6
            issues.append({
                "id": "rs-fresher-missing",
                "section": "structure",
                "title": "Missing essential entry-level sections",
                "description": "Fresher resumes must include Education, Technical Skills, and Projects.",
                "suggestion": "Include clear separate sections for Education, Technical Skills, and Projects."
            })
    else:
        # Experienced / Mid / Senior Candidates
        core_expected = {"Contact Info", "Skills", "Education", "Experience"}
        missing_core = core_expected - set(sections_present)

        if len(missing_core) == 0:
            if len(sections_present) >= 5:
                score += 15
                feedback.append(f"Standard linear section hierarchy verified ({len(sections_present)} sections detected).")
            else:
                score += 12
                feedback.append("Standard core sections detected. Consider adding a Projects or Certifications section.")
        elif len(missing_core) == 1:
            score += 8
            omitted = list(missing_core)[0]
            issues.append({
                "id": "rs-missing-core",
                "section": "structure",
                "title": f"Missing standard section: {omitted}",
                "description": f"Enterprise ATS parsers expect standard headers including {omitted}.",
                "suggestion": f"Create an explicit header for '{omitted}' with bulleted accomplishments."
            })
        else:
            score += 4
            issues.append({
                "id": "rs-multi-missing",
                "section": "structure",
                "title": f"Multiple standard sections missing ({', '.join(missing_core)})",
                "description": "Non-standard document organization impairs automated parsing algorithms.",
                "suggestion": "Reorganize resume with standard linear headers: Contact, Summary, Experience, Education, Skills."
            })

    score = min(max_score, max(1, score))

    return {
        "name": "Resume Structure",
        "score": score,
        "maxScore": max_score,
        "status": "Good" if score >= 12 else ("Moderate" if score >= 8 else "Needs Improvement"),
        "feedback": " ".join(feedback),
        "issues": issues
    }

def analyze_section_completeness(resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    3. Section Completeness (Max 15 points)
    Evaluates depth, substance, and completeness within sections (not mere presence).
    """
    max_score = RUBRIC_WEIGHTS["sectionCompleteness"] # 15
    score = 0
    feedback = []
    issues = []

    # Check Summary depth (0 to 3 pts)
    summary = str(resume.get("summary") or "").strip()
    sum_words = len(summary.split())
    if sum_words >= 30:
        score += 3
        feedback.append("Substantive professional summary with clear value proposition.")
    elif sum_words >= 15:
        score += 2
    elif sum_words > 0:
        score += 1
    else:
        score += 0
        issues.append({
            "id": "sc-no-summary",
            "section": "summary",
            "title": "Professional summary is empty",
            "description": "A well-crafted 30–50 word summary primes ATS semantic matching on your target career track.",
            "suggestion": "Add a professional summary outlining your primary title, key technical domains, and key strengths."
        })

    # Check Education depth (0 to 4 pts)
    edu = resume.get("education") or []
    if len(edu) > 0:
        first_edu = edu[0] if isinstance(edu[0], dict) else {}
        has_degree = bool(first_edu.get("degree"))
        has_inst = bool(first_edu.get("institution"))
        has_date = bool(first_edu.get("graduationDate") or first_edu.get("endDate"))

        if has_degree and has_inst and has_date:
            score += 4
            feedback.append("Complete academic credentials with degree, institution, and completion date.")
        elif has_degree and has_inst:
            score += 3
        else:
            score += 2
    else:
        score += 1
        issues.append({
            "id": "sc-no-edu",
            "section": "education",
            "title": "Education section incomplete or absent",
            "description": "Job requirements frequently filter on minimum education qualifications.",
            "suggestion": "List your highest degree, field of study, university/college name, and graduation year."
        })

    # Check Experience / Projects detail depth (0 to 5 pts)
    bullets = extract_all_resume_bullets(resume)
    if len(bullets) >= 8:
        score += 5
        feedback.append(f"Substantive depth across roles and projects ({len(bullets)} detailed bullet points).")
    elif len(bullets) >= 4:
        score += 3
        feedback.append(f"Moderate detail provided ({len(bullets)} bullet points).")
    elif len(bullets) >= 1:
        score += 2
        issues.append({
            "id": "sc-sparse-bullets",
            "section": "experience",
            "title": "Sparse experience descriptions",
            "description": f"Only {len(bullets)} bullet points found across all positions and projects.",
            "suggestion": "Aim for 3–5 bullet points per role detailing technical architecture, responsibilities, and results."
        })
    else:
        score += 0
        issues.append({
            "id": "sc-no-bullets",
            "section": "experience",
            "title": "Zero descriptive bullet points found",
            "description": "Roles or projects list titles without detailing what work was performed.",
            "suggestion": "Add bullet points to each position describing your specific technical contributions."
        })

    # Check Skills categorization (0 to 3 pts)
    skills = resume.get("skills") or {}
    if isinstance(skills, dict):
        populated_cats = sum(1 for v in skills.values() if isinstance(v, list) and len(v) > 0)
        if populated_cats >= 3:
            score += 3
            feedback.append(f"Well-categorized skills matrix ({populated_cats} domains populated).")
        elif populated_cats >= 1:
            score += 2
        else:
            score += 1
    elif isinstance(skills, list) and len(skills) >= 5:
        score += 2
    else:
        score += 1

    score = min(max_score, max(1, score))

    return {
        "name": "Section Completeness",
        "score": score,
        "maxScore": max_score,
        "status": "Good" if score >= 12 else ("Moderate" if score >= 8 else "Needs Improvement"),
        "feedback": " ".join(feedback),
        "issues": issues
    }

def analyze_skills_and_keyword_quality(resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    5. Skills & Keyword Quality (Max 15 points)
    Anti-Keyword Stuffing: Evaluates whether declared skills are actually supported
    in project/work context, diversity of domains, and technology specificity.
    """
    max_score = RUBRIC_WEIGHTS["skillsKeywordQuality"] # 15
    score = 0
    feedback = []
    issues = []

    context_audit = analyze_skill_contextual_verification(resume)
    total_declared = context_audit["totalDeclared"]
    context_ratio = context_audit["contextualRatio"]
    is_stuffed = context_audit["isKeywordStuffed"]

    # Signal 5.1: Skill Breadth & Domain Coverage (0 to 5 pts)
    if total_declared >= 12:
        score += 5
        feedback.append(f"Strong technical skill variety ({total_declared} competencies listed).")
    elif total_declared >= 6:
        score += 4
        feedback.append(f"Good core skill coverage ({total_declared} competencies).")
    elif total_declared >= 3:
        score += 2
        issues.append({
            "id": "sk-low-count",
            "section": "skills",
            "title": f"Low technical skills count ({total_declared} listed)",
            "description": "ATS keyword indexers favor comprehensive coverage of languages, frameworks, and tools.",
            "suggestion": "List 8–15 specific technologies you have hands-on experience with."
        })
    else:
        score += 1
        issues.append({
            "id": "sk-sparse",
            "section": "skills",
            "title": "Critically sparse skills section",
            "description": "Less than 3 recognized skills detected.",
            "suggestion": "Create a dedicated Technical Skills section with Languages, Frameworks, and Tools."
        })

    # Signal 5.2: Contextual Verification / Anti-Stuffing (0 to 7 pts)
    if is_stuffed:
        score = max(2, score - 3)
        issues.append({
            "id": "sk-keyword-stuffing",
            "section": "skills",
            "title": "Keyword stuffing hazard detected",
            "description": f"Lists {total_declared} skills, but only {context_audit['verifiedInContext']} appear in actual projects/experience.",
            "suggestion": "Support every listed skill with concrete project bullet points demonstrating where you applied it."
        })
    elif context_ratio >= 0.6 and total_declared >= 6:
        score += 7
        feedback.append(f"High contextual proof ({int(context_ratio * 100)}% of skills verified in project/work descriptions).")
    elif context_ratio >= 0.35:
        score += 4
        feedback.append(f"Moderate contextual validation ({int(context_ratio * 100)}% of skills referenced in bullets).")
    else:
        score += 2
        unverified_sample = context_audit.get("unverifiedSkills", [])[:4]
        issues.append({
            "id": "sk-unverified-skills",
            "section": "skills",
            "title": f"Skills not demonstrated in work history ({', '.join(unverified_sample)})",
            "description": "Listing skills without mentioning them in your accomplishments reduces semantic relevance.",
            "suggestion": "Mention key technologies like " + (', '.join(unverified_sample) if unverified_sample else "your tools") + " in project descriptions."
        })

    # Signal 5.3: Categorized Matrix (0 to 3 pts)
    skills = resume.get("skills") or {}
    if isinstance(skills, dict):
        populated = sum(1 for v in skills.values() if isinstance(v, list) and len(v) > 0)
        if populated >= 3:
            score += 3
            feedback.append("Skills cleanly structured into distinct technical domains.")
        else:
            score += 1
    else:
        score += 1
        issues.append({
            "id": "sk-uncategorized",
            "section": "skills",
            "title": "Uncategorized technical skills",
            "description": "A flat comma-separated skills dump is harder for ATS parsers to index accurately.",
            "suggestion": "Group skills into categories: Languages, Frameworks & Libraries, Databases, and Tools."
        })

    score = min(max_score, max(1, score))

    return {
        "name": "Skills & Keyword Quality",
        "score": score,
        "maxScore": max_score,
        "status": "Good" if score >= 12 else ("Moderate" if score >= 8 else "Needs Improvement"),
        "feedback": " ".join(feedback),
        "issues": issues,
        "contextualRatio": context_ratio,
        "verifiedSkillsCount": context_audit.get("verifiedInContext", 0),
        "isKeywordStuffed": is_stuffed
    }

def analyze_formatting_and_ats_safety(resume: Dict[str, Any], raw_text: str = "") -> Dict[str, Any]:
    """
    7. Formatting & ATS Safety (Max 10 points)
    Evaluates document layout safety, single-stream reading flow, absence of tables/columns/graphics,
    and optimal word length (350–1200 words).
    """
    max_score = RUBRIC_WEIGHTS["formattingAtsSafety"] # 10
    score = 0
    feedback = []
    issues = []

    text_to_check = raw_text or str(resume)
    word_count = len(text_to_check.split())

    # Signal 7.1: Word Count / Document Length (0 to 4 pts)
    if 350 <= word_count <= 1100:
        score += 4
        feedback.append(f"Optimal 1–2 page document length ({word_count} words).")
    elif 200 <= word_count < 350:
        score += 2
        issues.append({
            "id": "fmt-too-brief",
            "section": "formatting",
            "title": f"Document length is brief ({word_count} words)",
            "description": "Standard resumes should provide between 350 and 1,000 words of technical evidence.",
            "suggestion": "Expand on your project architectures and specific technical accomplishments."
        })
    elif word_count > 1500:
        score += 2
        issues.append({
            "id": "fmt-too-long",
            "section": "formatting",
            "title": f"Document exceeds optimal length ({word_count} words)",
            "description": "Excessively long resumes risk candidate fatigue and parsing timeouts in enterprise ATS.",
            "suggestion": "Condense older or less relevant positions and limit document to 1–2 pages."
        })
    else:
        score += 1
        issues.append({
            "id": "fmt-critically-brief",
            "section": "formatting",
            "title": "Document is critically brief",
            "description": "Less than 200 words extracted. Provides insufficient evidence for ATS ranking.",
            "suggestion": "Expand your resume with complete sections for Summary, Experience, Education, and Projects."
        })

    # Signal 7.2: Layout Hazard Detection (0 to 6 pts)
    # Check for table artifacts
    has_tables = bool(re.search(FORMATTING_HAZARDS["tables"], text_to_check))
    # Check for multi-column artifacts
    has_columns = bool(re.search(FORMATTING_HAZARDS["columns"], text_to_check))
    # Check for decorative bullets
    has_decorations = bool(re.search(FORMATTING_HAZARDS["decorative_bullets"], text_to_check))

    hazards_found = sum([has_tables, has_columns, has_decorations])

    if hazards_found == 0:
        score += 6
        feedback.append("Clean single-stream reading flow with zero table or multi-column hazards detected.")
    elif hazards_found == 1:
        score += 4
        hazard_name = "complex tables" if has_tables else ("multi-column blocks" if has_columns else "decorative icons")
        issues.append({
            "id": "fmt-minor-hazard",
            "section": "formatting",
            "title": f"Potential parsing hazard: {hazard_name}",
            "description": f"Detected {hazard_name} which can cause text reordering in older ATS parsers.",
            "suggestion": "Convert multi-column blocks and tables into a clean, top-to-bottom single-column layout."
        })
    else:
        score += 1
        issues.append({
            "id": "fmt-severe-hazards",
            "section": "formatting",
            "title": "Multiple layout hazards detected (columns / tables / decorative icons)",
            "description": "Dual columns and complex tables are the #1 cause of garbled ATS parsing.",
            "suggestion": "Adopt a clean single-column linear layout without tables, text boxes, or decorative graphics."
        })

    score = min(max_score, max(1, score))

    return {
        "name": "Formatting & ATS Safety",
        "score": score,
        "maxScore": max_score,
        "status": "Good" if score >= 8 else ("Moderate" if score >= 5 else "Needs Improvement"),
        "feedback": " ".join(feedback),
        "issues": issues
    }

# =============================================================================
# TOP 5 ACTIONABLE IMPROVEMENTS GENERATOR
# =============================================================================

def generate_top_5_improvements(all_issues: List[Dict[str, str]], rubric: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Synthesize exactly the top 5 most impactful improvements.
    Each includes: title, section, priority (HIGH/MEDIUM/LOW), reason, expectedImpact (+pts).
    """
    candidates = []

    # Map issue IDs to impact priorities
    for iss in all_issues:
        iss_id = iss.get("id", "")
        title = iss.get("title", "")
        desc = iss.get("description", "")
        sug = iss.get("suggestion", "")
        section = iss.get("section", "general")

        priority = "MEDIUM"
        impact_pts = 4

        if "zero-metrics" in iss_id or "low-metrics" in iss_id:
            priority = "HIGH"
            impact_pts = 6
        elif "keyword-stuffing" in iss_id:
            priority = "HIGH"
            impact_pts = 5
        elif "weak-verbs" in iss_id or "heavy-passive" in iss_id:
            priority = "HIGH"
            impact_pts = 4
        elif "severe-hazards" in iss_id or "columns" in iss_id:
            priority = "HIGH"
            impact_pts = 5
        elif "missing-core" in iss_id or "multi-missing" in iss_id:
            priority = "HIGH"
            impact_pts = 5
        elif "unverified-skills" in iss_id:
            priority = "MEDIUM"
            impact_pts = 3
        elif "first-person" in iss_id:
            priority = "LOW"
            impact_pts = 2
        elif "too-brief" in iss_id or "sparse" in iss_id:
            priority = "MEDIUM"
            impact_pts = 3
        else:
            priority = "MEDIUM"
            impact_pts = 3

        candidates.append({
            "title": title,
            "section": section,
            "priority": priority,
            "reason": desc,
            "suggestion": sug,
            "expectedImpact": f"+{impact_pts} pts"
        })

    # Sort HIGH > MEDIUM > LOW
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    candidates.sort(key=lambda x: priority_order.get(x["priority"], 1))

    # Top 5 unique
    unique_improvements = []
    seen_titles = set()
    for c in candidates:
        if c["title"] not in seen_titles:
            seen_titles.add(c["title"])
            unique_improvements.append(c)
        if len(unique_improvements) == 5:
            break

    # If fewer than 5 issues, backfill with standard high-value optimizations
    fallback_recommendations = [
        {
            "title": "Incorporate measurable business impact",
            "section": "experience",
            "priority": "HIGH",
            "reason": "Top-tier ATS profiles emphasize percentage reductions, revenue scale, or latency improvements.",
            "suggestion": "Quantify outcomes with figures like 'improved query performance by 35%'.",
            "expectedImpact": "+4 pts"
        },
        {
            "title": "Lead every bullet with power action verbs",
            "section": "experience",
            "priority": "MEDIUM",
            "reason": "Active verbs like 'Architected' or 'Spearheaded' demonstrate assertive leadership.",
            "suggestion": "Replace passive openings with past-tense power verbs.",
            "expectedImpact": "+3 pts"
        },
        {
            "title": "Strengthen technical skill context in projects",
            "section": "skills",
            "priority": "MEDIUM",
            "reason": "Mention key frameworks and databases directly within project accomplishment bullets.",
            "suggestion": "State the tech stack in parentheses or bullet text for every project.",
            "expectedImpact": "+3 pts"
        },
        {
            "title": "Ensure single-column ATS layout consistency",
            "section": "formatting",
            "priority": "LOW",
            "reason": "Single-stream layouts minimize text fragmentation during automated OCR and tokenization.",
            "suggestion": "Verify clean top-to-bottom reading hierarchy across all pages.",
            "expectedImpact": "+2 pts"
        },
        {
            "title": "Refine 3-sentence executive summary",
            "section": "summary",
            "priority": "LOW",
            "reason": "A strong professional summary primes semantic keyword matchers for your target role.",
            "suggestion": "Highlight your core title, years of experience, and primary stack.",
            "expectedImpact": "+2 pts"
        }
    ]

    for fb in fallback_recommendations:
        if len(unique_improvements) >= 5:
            break
        if fb["title"] not in seen_titles:
            seen_titles.add(fb["title"])
            unique_improvements.append(fb)

    return unique_improvements[:5]

# =============================================================================
# MAIN TWO-LAYER ATS COMPATIBILITY ENGINE
# =============================================================================

def calculate_ats_score(
    resume: Dict[str, Any],
    role_data: Optional[Dict[str, Any]] = None,
    raw_text: str = "",
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Execute two-layer ATS analysis:
    - Layer 1: Deterministic ATS Engine (Readability, Structure, Completeness, Keywords, Formatting)
    - Layer 2: AI / NLP Semantic Evaluator (Content Quality, Project Depth, Professional Language)
    - Validation Layer: Reconciles signals, calculates Confidence, and generates Top 5 Improvements.
    """
    cache_key = compute_cache_key(resume, role_data)
    if not force_refresh and cache_key in ANALYSIS_CACHE:
        return ANALYSIS_CACHE[cache_key]

    # Layer 1: Deterministic Category Evaluation
    cat_readability = analyze_machine_readability(resume, raw_text)
    cat_structure = analyze_resume_structure(resume)
    cat_completeness = analyze_section_completeness(resume)
    cat_keywords = analyze_skills_and_keyword_quality(resume)
    cat_formatting = analyze_formatting_and_ats_safety(resume, raw_text)

    # Layer 2: AI / NLP Semantic Evaluation
    local_semantic = evaluate_semantic_locally(resume)
    semantic_plan = evaluate_semantic_with_llm(resume, local_semantic)

    cat_content_quality = {
        "name": "Content Quality",
        "score": semantic_plan.contentQuality.score,
        "maxScore": semantic_plan.contentQuality.maxScore,
        "status": "Good" if semantic_plan.contentQuality.score >= 12 else ("Moderate" if semantic_plan.contentQuality.score >= 8 else "Needs Improvement"),
        "feedback": semantic_plan.contentQuality.feedback,
        "issues": semantic_plan.contentQuality.issues
    }

    cat_experience_projects = {
        "name": "Experience & Project Quality",
        "score": semantic_plan.experienceProjectQuality.score,
        "maxScore": semantic_plan.experienceProjectQuality.maxScore,
        "status": "Good" if semantic_plan.experienceProjectQuality.score >= 8 else ("Moderate" if semantic_plan.experienceProjectQuality.score >= 5 else "Needs Improvement"),
        "feedback": semantic_plan.experienceProjectQuality.feedback,
        "issues": semantic_plan.experienceProjectQuality.issues
    }

    cat_language = {
        "name": "Professional Language",
        "score": semantic_plan.professionalLanguage.score,
        "maxScore": semantic_plan.professionalLanguage.maxScore,
        "status": "Good" if semantic_plan.professionalLanguage.score >= 4 else "Needs Improvement",
        "feedback": semantic_plan.professionalLanguage.feedback,
        "issues": semantic_plan.professionalLanguage.issues
    }

    # 8-Category Rubric Dictionary
    category_scores = {
        "machineReadability": cat_readability,
        "resumeStructure": cat_structure,
        "sectionCompleteness": cat_completeness,
        "contentQuality": cat_content_quality,
        "skillsKeywordQuality": cat_keywords,
        "experienceProjectQuality": cat_experience_projects,
        "formattingAtsSafety": cat_formatting,
        "professionalLanguage": cat_language
    }

    # Total Score = Sum of 8 calibrated dimensions (Max 100)
    total_score = sum(c["score"] for c in category_scores.values())
    total_score = max(0, min(100, total_score))

    # Compile all detected issues
    all_issues = []
    for cat in category_scores.values():
        all_issues.extend(cat.get("issues", []))

    # Compile verified strengths from dimensions scoring >= 80%
    strengths = []
    for cat in category_scores.values():
        if cat["score"] >= int(cat["maxScore"] * 0.8):
            strengths.append(f"{cat['name']}: {cat['feedback']}")
    if not strengths:
        strengths.append("Baseline machine readability and core document sections detected.")

    # Top 5 Actionable Improvements
    top_5_improvements = generate_top_5_improvements(all_issues, category_scores)

    # Calculate Analysis Confidence Score (75% to 98%)
    # Influenced by: text extractability, non-empty sections, contextual skill ratio, and absence of hazard flags
    text_len = len(raw_text or str(resume))
    confidence = 82
    if text_len >= 1200: confidence += 5
    if len(extract_all_resume_bullets(resume)) >= 6: confidence += 4
    if not cat_keywords.get("isKeywordStuffed"): confidence += 3
    if cat_readability["score"] >= 13: confidence += 4
    confidence = min(98, max(75, confidence))

    # Calibration Band Assignment
    band_label = "Moderate ATS Compatibility"
    for band_key, band_data in CALIBRATION_BANDS.items():
        if band_data["min"] <= total_score <= band_data["max"]:
            band_label = band_data["label"]
            break

    # Simplified 6-key categories map for backward compatibility with older UI widgets
    simplified_categories = {
        "machineReadability": cat_readability["score"],
        "structure": cat_structure["score"],
        "sectionCompleteness": cat_completeness["score"],
        "contentQuality": cat_content_quality["score"],
        "skillsKeywordQuality": cat_keywords["score"],
        "experienceProjectQuality": cat_experience_projects["score"],
        "formatting": cat_formatting["score"],
        "readability": cat_content_quality["score"],
        "keywordQuality": cat_keywords["score"]
    }

    # Role-Specific Score (If Job Description provided)
    role_match_score = None
    if role_data and (role_data.get("role") or role_data.get("jobTitle") or role_data.get("description")):
        from app.services.semantic_matcher import perform_resume_role_matching
        match_result = perform_resume_role_matching(resume, role_data)
        role_match_score = match_result.get("matchPercentage", total_score)

    result_payload = {
        "label": "ATS Compatibility Score",
        "score": total_score,
        "overallScore": total_score,
        "generalScore": total_score,
        "roleScore": role_match_score,
        "displayScore": f"{total_score} / 100",
        "calibrationBand": band_label,
        "confidenceScore": confidence,
        "disclaimer": "This score estimates resume compatibility using structural, content, formatting, keyword, readability, and semantic signals. Actual ATS behavior varies by platform.",
        "categoryScores": category_scores,
        "breakdown": category_scores,
        "categories": simplified_categories,
        "strengths": strengths,
        "issues": all_issues,
        "topImprovements": top_5_improvements,
        "suggestions": [i["suggestion"] for i in top_5_improvements],
        "careerStage": detect_career_stage(resume),
        "evaluatedAt": datetime.now(timezone.utc).isoformat()
    }

    # Store in cache
    ANALYSIS_CACHE[cache_key] = result_payload
    return result_payload
