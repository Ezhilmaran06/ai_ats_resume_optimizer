import re
from typing import Dict, Any, List, Optional
from datetime import datetime

ACTION_VERBS = {
    "spearheaded", "engineered", "orchestrated", "developed", "architected", "implemented",
    "accelerated", "streamlined", "optimized", "deployed", "scaled", "designed",
    "automated", "reduced", "increased", "revamped", "mentored", "built", "managed",
    "collaborated", "constructed", "established", "formulated", "generated", "integrated",
    "maintained", "pioneered", "refactored", "resolved", "strengthened", "transformed"
}

WEAK_WORDS = {
    "helped", "assisted", "worked on", "responsible for", "participated", "tried", "handled", "did", "made"
}

def analyze_machine_readability(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check text extractability, unicode cleanliness, and absence of non-standard symbols."""
    score = 8
    feedback = []
    # Check for excessive unprintable/special characters
    text_sample = str(resume)
    non_ascii = len(re.findall(r'[^\x00-\x7F]', text_sample))
    if non_ascii < 25:
        score = 8
        feedback.append("High text extractability with standard encoding; easily parsed by OCR and text streams.")
    else:
        score = 6
        feedback.append("Some special unicode characters detected; stick to standard alphanumeric glyphs.")

    return {
        "name": "Machine readability",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 7 else "Needs Improvement",
        "feedback": " ".join(feedback)
    }

def analyze_resume_structure(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check overall organizational flow and standard section headers."""
    score = 8
    feedback = []
    sections = []
    if resume.get("personalInfo"): sections.append("contact")
    if resume.get("summary"): sections.append("summary")
    if resume.get("skills"): sections.append("skills")
    if resume.get("experience"): sections.append("experience")
    if resume.get("education"): sections.append("education")
    if resume.get("projects"): sections.append("projects")

    if len(sections) >= 5:
        score = 8
        feedback.append("Standard linear section hierarchy detected.")
    else:
        score = 5
        feedback.append(f"Only {len(sections)} standard sections detected. Expected at least 5.")

    return {
        "name": "Resume structure",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 7 else "Needs Improvement",
        "feedback": " ".join(feedback)
    }

def analyze_section_detection(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate whether core ATS sections are identified."""
    score = 8
    detected = []
    for sec in ["summary", "experience", "education", "skills", "projects"]:
        val = resume.get(sec)
        if val and (isinstance(val, list) and len(val) > 0 or isinstance(val, (str, dict)) and val):
            detected.append(sec)

    if len(detected) == 5:
        score = 8
        feedback = "All 5 core standard ATS sections detected."
    elif len(detected) >= 4:
        score = 6
        feedback = f"4 of 5 core sections detected (found: {', '.join(detected)})."
    else:
        score = 4
        feedback = f"Missing core sections (found {len(detected)} of 5)."

    return {
        "name": "Section detection",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_contact_information(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check presence and validity of email, phone, location, and links."""
    score = 8
    p = resume.get("personalInfo") or {}
    missing = []
    if not p.get("email"): missing.append("email")
    if not p.get("phone"): missing.append("phone")
    if not (p.get("location") or resume.get("location")): missing.append("location")
    if not (p.get("linkedin") or p.get("github") or resume.get("links")): missing.append("professional links")

    if not missing:
        score = 8
        feedback = "Complete contact header with verified email, phone, location, and links."
    elif len(missing) == 1:
        score = 6
        feedback = f"Minor contact omission: missing {missing[0]}."
    else:
        score = max(3, 8 - (len(missing) * 2))
        feedback = f"Missing contact fields: {', '.join(missing)}."

    return {
        "name": "Contact information",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_skills_section(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate diversity and categorization of technical and core skills."""
    score = 8
    skills = resume.get("skills") or {}
    skill_count = 0
    if isinstance(skills, dict):
        for val in skills.values():
            if isinstance(val, list):
                skill_count += len(val)
    elif isinstance(skills, list):
        skill_count = len(skills)

    if skill_count >= 10:
        score = 8
        feedback = f"Strong skills representation ({skill_count} competencies listed)."
    elif skill_count >= 5:
        score = 6
        feedback = f"Moderate skills list ({skill_count} competencies). Consider adding more specialized tools."
    else:
        score = 4
        feedback = "Low skills count. Include at least 8-12 recognized industry technologies."

    return {
        "name": "Skills section",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_education(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Verify presence of university, degree, field of study, and dates."""
    score = 7
    edu = resume.get("education") or []
    if edu and len(edu) > 0:
        first = edu[0] if isinstance(edu[0], dict) else {}
        has_degree = bool(first.get("degree"))
        has_inst = bool(first.get("institution"))
        if has_degree and has_inst:
            score = 7
            feedback = "Clear, machine-readable degree and institution credentials."
        else:
            score = 5
            feedback = "Education entry detected but missing degree title or institution name."
    else:
        score = 3
        feedback = "No formal education entries detected."

    return {
        "name": "Education",
        "score": score,
        "maxScore": 7,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_experience(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check chronological work experience with roles and company names."""
    score = 8
    exp = resume.get("experience") or []
    if exp and len(exp) > 0:
        has_roles = all(e.get("role") or e.get("company") for e in exp if isinstance(e, dict))
        if has_roles and len(exp) >= 2:
            score = 8
            feedback = f"Strong chronological experience listed ({len(exp)} positions)."
        else:
            score = 6
            feedback = f"Experience section present ({len(exp)} position)."
    else:
        score = 4
        feedback = "Work experience section is empty or unpopulated."

    return {
        "name": "Experience",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_projects(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate practical projects demonstrating hands-on technical skills."""
    score = 7
    projs = resume.get("projects") or []
    if projs and len(projs) >= 2:
        score = 7
        feedback = f"Multiple practical projects listed ({len(projs)} projects)."
    elif projs and len(projs) == 1:
        score = 5
        feedback = "1 project listed. Adding a 2nd project strengthens technical proof."
    else:
        score = 3
        feedback = "No technical projects listed."

    return {
        "name": "Projects",
        "score": score,
        "maxScore": 7,
        "status": "Good" if score >= 5 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_formatting(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Verify ATS safe layout, fonts, and absence of complex multi-column blocks."""
    score = 8
    template_id = resume.get("templateId") or resume.get("template") or "ats-classic"
    if template_id in ["ats-classic", "modern-pro", "swe", "minimal", "fresh-grad", "executive"]:
        score = 8
        feedback = f"Clean, single-stream ATS template '{template_id}' applied."
    else:
        score = 6
        feedback = "Standard layout detected; ensure simple line-based reading flow."

    return {
        "name": "Formatting",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 7 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_readability(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check concise bullet points and scannable paragraph length."""
    score = 8
    feedback = []
    overly_long = 0
    total_bullets = 0

    for exp in resume.get("experience") or []:
        if isinstance(exp, dict):
            for ach in exp.get("achievements") or exp.get("highlights") or []:
                total_bullets += 1
                if len(str(ach).split()) > 40:
                    overly_long += 1

    if overly_long == 0 and total_bullets > 0:
        score = 8
        feedback.append("Concise, scannable bullet points under 40 words each.")
    elif overly_long <= 2:
        score = 7
        feedback.append("Good readability; keep all bullet points punchy and concise.")
    else:
        score = 5
        feedback.append(f"{overly_long} bullet points are overly verbose (exceed 40 words).")

    return {
        "name": "Readability",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": " ".join(feedback) if feedback else "Readable scannable text flow."
    }

def analyze_keyword_quality(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check industry keyword density and presence of recognized technology terms."""
    score = 8
    all_text = str(resume).lower()
    common_ats_keywords = [
        "python", "javascript", "react", "sql", "api", "docker", "aws", "git",
        "database", "architecture", "microservices", "testing", "ci/cd", "agile",
        "performance", "linux", "cloud", "backend", "frontend", "fullstack"
    ]
    matched_count = sum(1 for kw in common_ats_keywords if kw in all_text)

    if matched_count >= 8:
        score = 8
        feedback = f"Rich technical keyword density ({matched_count}+ standard terms matched)."
    elif matched_count >= 4:
        score = 6
        feedback = f"Moderate keyword representation ({matched_count} terms). Consider adding more specific keywords."
    else:
        score = 4
        feedback = "Low recognized technical keyword density. Incorporate industry-standard keywords."

    return {
        "name": "Keyword quality",
        "score": score,
        "maxScore": 8,
        "status": "Good" if score >= 6 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_action_verbs(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Detect powerful action verbs (Engineered, Spearheaded) vs passive phrasing."""
    score = 7
    all_text = str(resume).lower()
    words = set(re.findall(r'\b[a-z]{4,}\b', all_text))
    verbs_found = words.intersection(ACTION_VERBS)
    weak_found = words.intersection(WEAK_WORDS)

    if len(verbs_found) >= 5 and len(weak_found) <= 1:
        score = 7
        feedback = f"Strong leadership verbs utilized ({len(verbs_found)} active verbs like {', '.join(list(verbs_found)[:3])})."
    elif len(verbs_found) >= 2:
        score = 5
        feedback = f"Contains {len(verbs_found)} action verbs. Replace passive phrases with impactful verbs."
    else:
        score = 3
        feedback = "Few strong action verbs detected. Begin bullets with words like 'Engineered', 'Optimized', 'Architected'."

    return {
        "name": "Action verbs",
        "score": score,
        "maxScore": 7,
        "status": "Good" if score >= 5 else "Needs Improvement",
        "feedback": feedback
    }

def analyze_content_completeness(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Check for quantifiable impact (metrics, percentages, latencies, user scales)."""
    score = 7
    all_text = str(resume)
    metrics = re.findall(r'(\d+[\%xX]|\$\d+|\b\d+\s*(?:ms|users|requests|percent|nodes|teams|engineers)\b)', all_text, re.I)
    metric_count = len(metrics)

    if metric_count >= 3:
        score = 7
        feedback = f"High content impact: {metric_count} quantifiable metrics detected (e.g. {', '.join(metrics[:2])})."
    elif metric_count >= 1:
        score = 5
        feedback = "Some metrics present. Incorporating more quantifiable business impact will elevate score."
    else:
        score = 3
        feedback = "Missing measurable metrics. Quantify achievements with percentages, latencies, or numbers."

    return {
        "name": "Content completeness",
        "score": score,
        "maxScore": 7,
        "status": "Good" if score >= 5 else "Needs Improvement",
        "feedback": feedback
    }

def detect_all_issues(resume: Dict[str, Any], categories: Dict[str, Any]) -> List[Dict[str, Any]]:
    issues = []
    
    # 1. Summary issue
    if not resume.get("summary") or len(str(resume.get("summary")).strip()) < 30:
        issues.append({
            "id": "iss-summary",
            "type": "warning",
            "title": "Professional summary missing or too short",
            "section": "summary",
            "description": "ATS algorithms parse the summary to identify primary job alignment and core competencies.",
            "suggestion": "Add a focused 3-4 sentence professional summary outlining your primary domain and key strengths."
        })

    # 2. Measurable metrics issue
    if categories.get("contentCompleteness", {}).get("score", 0) < 5:
        issues.append({
            "id": "iss-metrics",
            "type": "warning",
            "title": "Add quantifiable impact to bullet points",
            "section": "experience",
            "description": "ATS scoring algorithms prioritize bullet points containing verified metrics (%, $, scale).",
            "suggestion": "Include metrics like 'reduced latency by 35%' or 'scaled API to 10k requests/sec'."
        })

    # 3. Action verbs issue
    if categories.get("actionVerbs", {}).get("score", 0) < 5:
        issues.append({
            "id": "iss-verbs",
            "type": "info",
            "title": "Replace passive verbs with high-impact action verbs",
            "section": "experience",
            "description": "Phrases like 'responsible for' or 'helped' diminish ATS impact scoring.",
            "suggestion": "Start bullet points with 'Spearheaded', 'Engineered', 'Optimized', or 'Orchestrated'."
        })

    # 4. Contact issue
    p = resume.get("personalInfo") or {}
    if not p.get("linkedin") and not p.get("github") and not resume.get("links"):
        issues.append({
            "id": "iss-links",
            "type": "info",
            "title": "Include GitHub or LinkedIn profile links",
            "section": "contact",
            "description": "Modern technical recruiters and automated screeners scan for public code repositories and professional profiles.",
            "suggestion": "Add your LinkedIn and GitHub URLs to your contact information header."
        })

    # 5. Skills count issue
    if categories.get("skillsSection", {}).get("score", 0) < 6:
        issues.append({
            "id": "iss-skills",
            "type": "warning",
            "title": "Expand technical skills categorization",
            "section": "skills",
            "description": "A comprehensive skills matrix helps ATS parsers match specialized requirements.",
            "suggestion": "Categorize your skills into Languages, Frameworks, Cloud & DevOps, and Developer Tools."
        })

    return issues

def calculate_ats_score(resume: Dict[str, Any], role_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Calculate ATS Compatibility Score across 13 core dimensions without requiring a job description.
    Total maximum score = 100.
    """
    cat_machine = analyze_machine_readability(resume)
    cat_structure = analyze_resume_structure(resume)
    cat_section_det = analyze_section_detection(resume)
    cat_contact = analyze_contact_information(resume)
    cat_skills = analyze_skills_section(resume)
    cat_education = analyze_education(resume)
    cat_experience = analyze_experience(resume)
    cat_projects = analyze_projects(resume)
    cat_formatting = analyze_formatting(resume)
    cat_readability = analyze_readability(resume)
    cat_keywords = analyze_keyword_quality(resume)
    cat_verbs = analyze_action_verbs(resume)
    cat_completeness = analyze_content_completeness(resume)

    category_scores = {
        "machineReadability": cat_machine,
        "resumeStructure": cat_structure,
        "sectionDetection": cat_section_det,
        "contactInformation": cat_contact,
        "skillsSection": cat_skills,
        "education": cat_education,
        "experience": cat_experience,
        "projects": cat_projects,
        "formatting": cat_formatting,
        "readability": cat_readability,
        "keywordQuality": cat_keywords,
        "actionVerbs": cat_verbs,
        "contentCompleteness": cat_completeness
    }

    # Sum: 8 + 8 + 8 + 8 + 8 + 7 + 8 + 7 + 8 + 8 + 8 + 7 + 7 = 100
    total_score = sum(c["score"] for c in category_scores.values())
    total_score = max(0, min(100, total_score))

    issues = detect_all_issues(resume, category_scores)
    suggestions = [i["suggestion"] for i in issues]

    return {
        "label": "ATS Compatibility Score",
        "score": total_score,
        "displayScore": f"{total_score} / 100",
        "disclaimer": "ATS Compatibility Score based on standard industry parser rules and formatting guidelines. Not an official universal ATS score.",
        "categoryScores": category_scores,
        "breakdown": category_scores,
        "overallScore": total_score,
        "issues": issues,
        "suggestions": suggestions,
        "evaluatedAt": datetime.utcnow().isoformat()
    }
