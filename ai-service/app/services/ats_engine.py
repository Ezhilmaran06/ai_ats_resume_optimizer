import re
from typing import Dict, Any, List, Optional
from datetime import datetime

ACTION_VERBS = {
    "spearheaded", "engineered", "orchestrated", "developed", "architected", "implemented",
    "accelerated", "streamlined", "optimized", "deployed", "scaled", "designed",
    "automated", "reduced", "increased", "revamped", "mentored", "built", "managed"
}

WEAK_WORDS = {
    "helped", "assisted", "worked on", "responsible for", "participated", "tried", "handled"
}

def analyze_structure(resume: Dict[str, Any]) -> Dict[str, Any]:
    score = 10
    feedback = []

    sections = []
    if resume.get("personalInfo"): sections.append("Contact")
    if resume.get("summary"): sections.append("Summary")
    if resume.get("skills"): sections.append("Skills")
    if resume.get("experience"): sections.append("Experience")
    if resume.get("education"): sections.append("Education")
    if resume.get("projects"): sections.append("Projects")

    if len(sections) >= 5:
        feedback.append("Standard ATS section structure detected.")
    else:
        missing = 5 - len(sections)
        score = max(4, score - (missing * 2))
        feedback.append(f"Missing recommended standard sections (found {len(sections)} of 5).")

    return {
        "category": "Resume Structure",
        "score": score,
        "maxScore": 10,
        "feedback": " ".join(feedback),
        "status": "Good" if score >= 8 else "Needs Improvement"
    }

def analyze_section_completeness(resume: Dict[str, Any]) -> Dict[str, Any]:
    score = 10
    missing = []
    p = resume.get("personalInfo") or {}

    if not p.get("email"): missing.append("Email")
    if not p.get("phone"): missing.append("Phone")
    if not resume.get("summary"): missing.append("Professional Summary")
    if not resume.get("skills"): missing.append("Skills List")
    if not resume.get("education"): missing.append("Education Details")

    if missing:
        score = max(3, 10 - (len(missing) * 2))
        feedback = f"Missing core fields: {', '.join(missing)}."
    else:
        feedback = "All primary resume sections are present and populated."

    return {
        "category": "Section Completeness",
        "score": score,
        "maxScore": 10,
        "feedback": feedback,
        "status": "Good" if score >= 8 else "Needs Improvement"
    }

def analyze_readability(resume: Dict[str, Any]) -> Dict[str, Any]:
    score = 10
    feedback = []
    
    # Check bullet points in experience and projects
    total_bullets = 0
    overly_long_bullets = 0

    for exp in resume.get("experience", []):
        for h in exp.get("highlights", []):
            total_bullets += 1
            if len(h.split()) > 45:
                overly_long_bullets += 1

    for proj in resume.get("projects", []):
        for h in proj.get("highlights", []):
            total_bullets += 1
            if len(h.split()) > 45:
                overly_long_bullets += 1

    if overly_long_bullets > 2:
        score -= 2
        feedback.append(f"{overly_long_bullets} bullet points exceed recommended length (keep under 40 words).")
    else:
        feedback.append("Bullet points maintain concise, scannable readability.")

    return {
        "category": "Readability",
        "score": max(5, score),
        "maxScore": 10,
        "feedback": " ".join(feedback),
        "status": "Good" if score >= 8 else "Needs Improvement"
    }

def analyze_keyword_quality(resume: Dict[str, Any], role_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    score = 20
    feedback = []
    skills = resume.get("skills", [])
    skill_names = [s.get("name", "").lower() for s in skills if isinstance(s, dict)]

    if len(skill_names) < 5:
        score -= 8
        feedback.append("Low skill diversity. Add at least 6-10 recognized technical skills.")
    elif len(skill_names) >= 10:
        feedback.append("Strong technical skill breadth.")

    if role_data and role_data.get("requiredSkills"):
        req_skills = [s.lower() for s in role_data.get("requiredSkills", [])]
        matched = [s for s in req_skills if any(s in sn or sn in s for sn in skill_names)]
        coverage = len(matched) / max(1, len(req_skills))
        role_pts = int(coverage * 10)
        score = min(20, 10 + role_pts)
        feedback.append(f"Matched {len(matched)} of {len(req_skills)} required role skills ({int(coverage*100)}%).")
    else:
        if len(skill_names) >= 8:
            score = 17
        elif len(skill_names) >= 5:
            score = 14
        else:
            score = 10
        feedback.append("Standard industry keyword density evaluated.")

    return {
        "category": "Keyword Quality",
        "score": score,
        "maxScore": 20,
        "feedback": " ".join(feedback),
        "status": "Good" if score >= 16 else "Needs Improvement"
    }

def analyze_skills_presentation(resume: Dict[str, Any]) -> Dict[str, Any]:
    score = 20
    feedback = []
    skills = resume.get("skills", [])

    categories = set(s.get("category", "General") for s in skills if isinstance(s, dict))
    if len(categories) >= 3:
        score = 18
        feedback.append(f"Skills are well categorized into {len(categories)} distinct technical domains.")
    elif len(categories) >= 1:
        score = 14
        feedback.append("Skills listed; categorizing them (Languages, Frameworks, Cloud) improves ATS parsing.")
    else:
        score = 8
        feedback.append("No categorized skills section detected.")

    return {
        "category": "Skills Presentation",
        "score": score,
        "maxScore": 20,
        "feedback": " ".join(feedback),
        "status": "Good" if score >= 16 else "Needs Improvement"
    }

def analyze_formatting(resume: Dict[str, Any]) -> Dict[str, Any]:
    score = 10
    template_id = resume.get("templateId", "ats-classic")
    feedback = []

    if "ats" in template_id or template_id in ["ats-classic", "modern-professional", "minimal"]:
        feedback.append("Using ATS-optimized single/clean-column document layout.")
        score = 9
    else:
        feedback.append("Standard layout applied; ensure clear heading hierarchies.")
        score = 8

    return {
        "category": "Formatting",
        "score": score,
        "maxScore": 10,
        "feedback": " ".join(feedback),
        "status": "Good" if score >= 8 else "Needs Improvement"
    }

def analyze_content_quality(resume: Dict[str, Any]) -> Dict[str, Any]:
    score = 20
    feedback = []
    
    # Check for strong action verbs and metrics
    action_verb_count = 0
    metric_count = 0
    all_highlights = []

    for exp in resume.get("experience", []):
        all_highlights.extend(exp.get("highlights", []))
    for proj in resume.get("projects", []):
        all_highlights.extend(proj.get("highlights", []))

    for h in all_highlights:
        words = set(re.findall(r'\b\w+\b', h.lower()))
        if words.intersection(ACTION_VERBS):
            action_verb_count += 1
        # Check for numbers, %, $, ms, x
        if re.search(r'(\d+[\%xX]?|\$\d+|\d+\s*(?:ms|seconds|users|requests|percent))', h):
            metric_count += 1

    if metric_count >= 3:
        feedback.append("Excellent use of quantified impact and measurable results.")
        score = 18
    elif metric_count >= 1:
        feedback.append("Some quantifiable achievements present; adding more metrics will strengthen ATS ranking.")
        score = 14
    else:
        feedback.append("Missing quantifiable achievements (e.g., percentages, latencies, user scale).")
        score = 11

    if action_verb_count >= 4:
        score = min(20, score + 2)

    return {
        "category": "Content Quality",
        "score": score,
        "maxScore": 20,
        "feedback": " ".join(feedback),
        "status": "Good" if score >= 16 else "Needs Improvement"
    }

def detect_ats_issues(resume: Dict[str, Any], role_data: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    issues = []
    
    # 1. Summary check
    summary = resume.get("summary", "")
    if not summary or len(summary.strip()) < 30:
        issues.append({
            "id": "issue-summary",
            "type": "warning",
            "title": "Missing or brief professional summary",
            "section": "summary",
            "description": "A tailored summary provides the ATS parser with immediate context on your domain and core competencies.",
            "suggestion": "Add a 3-4 sentence professional summary highlighting your key technologies and domain expertise.",
            "fixableWithAi": True
        })

    # 2. Measurable achievements check
    has_metrics = False
    for exp in resume.get("experience", []):
        for h in exp.get("highlights", []):
            if re.search(r'(\d+[\%xX]?|\$\d+|\b\d+\b)', h):
                has_metrics = True
                break
    if not has_metrics:
        issues.append({
            "id": "issue-metrics",
            "type": "warning",
            "title": "Missing measurable achievements",
            "section": "experience",
            "description": "ATS scoring algorithms favor bullet points with quantifiable results (e.g. 'improved latency by 35%').",
            "suggestion": "Quantify your achievements with performance percentages, user counts, or operational metrics.",
            "fixableWithAi": True
        })

    # 3. Project descriptions
    projects = resume.get("projects", [])
    if not projects:
        issues.append({
            "id": "issue-projects",
            "type": "info",
            "title": "No technical projects listed",
            "section": "projects",
            "description": "Hands-on projects validate tech stack capabilities, especially for engineering roles.",
            "suggestion": "Add 2-3 technical projects demonstrating your core technologies.",
            "fixableWithAi": True
        })
    else:
        short_projs = [p for p in projects if len(p.get("highlights", [])) == 0 and not p.get("description")]
        if short_projs:
            issues.append({
                "id": "issue-project-detail",
                "type": "warning",
                "title": "Some project descriptions are too generic",
                "section": "projects",
                "description": f"Projects like '{short_projs[0].get('title', 'Project')}' lack bullet points specifying architecture or outcome.",
                "suggestion": "Detail technologies used, system architecture, and verifiable features.",
                "fixableWithAi": True
            })

    # 4. Keyword gap if role provided
    if role_data and role_data.get("missingSkills"):
        missing = role_data.get("missingSkills", [])
        if missing:
            issues.append({
                "id": "issue-keywords",
                "type": "danger",
                "title": "Keyword coverage can be improved",
                "section": "skills",
                "description": f"Role explicitly requires keywords not detected in your resume: {', '.join(missing[:4])}.",
                "suggestion": "If you have verified experience with these technologies, ensure they are represented in your skills or projects.",
                "fixableWithAi": False
            })

    return issues

def detect_strengths(resume: Dict[str, Any]) -> List[str]:
    strengths = []
    if resume.get("skills") and len(resume.get("skills", [])) >= 6:
        strengths.append("Standard resume sections and strong technical skills")
    if resume.get("education"):
        strengths.append("Clear, machine-readable education section")
    if resume.get("personalInfo", {}).get("email") and resume.get("personalInfo", {}).get("phone"):
        strengths.append("Standard contact header with verified email and phone")
    if resume.get("experience"):
        strengths.append("Chronological work experience formatting")
    if not strengths:
        strengths.append("Clean document structure and machine-readable text")
    return strengths

def calculate_ats_score(resume: Dict[str, Any], role_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    cat_structure = analyze_structure(resume)
    cat_sections = analyze_section_completeness(resume)
    cat_readability = analyze_readability(resume)
    cat_keywords = analyze_keyword_quality(resume, role_data)
    cat_skills = analyze_skills_presentation(resume)
    cat_formatting = analyze_formatting(resume)
    cat_content = analyze_content_quality(resume)

    breakdown = {
        "structure": cat_structure,
        "sectionCompleteness": cat_sections,
        "readability": cat_readability,
        "keywordQuality": cat_keywords,
        "skillsPresentation": cat_skills,
        "formatting": cat_formatting,
        "contentQuality": cat_content
    }

    # Total score sum: 10 + 10 + 10 + 20 + 20 + 10 + 20 = 100
    overall_score = sum(cat["score"] for cat in breakdown.values())
    overall_score = max(0, min(100, overall_score))

    issues = detect_ats_issues(resume, role_data)
    strengths = detect_strengths(resume)

    recommendations = []
    for issue in issues:
        recommendations.append({
            "section": issue["section"],
            "title": issue["title"],
            "suggestion": issue["suggestion"]
        })

    return {
        "overallScore": overall_score,
        "mode": "role_specific" if role_data else "general",
        "targetRole": role_data.get("role") if role_data else resume.get("targetRole", ""),
        "breakdown": breakdown,
        "strengths": strengths,
        "issues": issues,
        "recommendations": recommendations,
        "timestamp": datetime.utcnow().isoformat()
    }
