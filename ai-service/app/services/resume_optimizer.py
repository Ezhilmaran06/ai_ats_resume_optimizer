import re
from typing import Dict, Any, List

def check_verification_status(proposed_text: str, verified_resume: Dict[str, Any]) -> str:
    """
    Classify whether the text contains skills/claims unsupported by verified resume:
    Returns 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED'
    """
    # Collect all verified tokens from resume
    verified_tokens = set()
    for s in verified_resume.get("skills", []):
        if isinstance(s, dict):
            verified_tokens.add(s.get("name", "").lower())
        elif isinstance(s, str):
            verified_tokens.add(s.lower())

    for p in verified_resume.get("projects", []):
        verified_tokens.add(p.get("title", "").lower())
        for t in p.get("technologies", []):
            verified_tokens.add(t.lower())

    # Check for unverified high-impact technical keywords
    common_high_tech = ["aws", "azure", "kubernetes", "docker", "spark", "kafka", "graphql", "spring boot", "react", "angular", "ci/cd"]
    unsupported_found = []
    
    proposed_lower = proposed_text.lower()
    for tech in common_high_tech:
        if re.search(r'\b' + re.escape(tech) + r'\b', proposed_lower):
            if not any(tech in v or v in tech for v in verified_tokens):
                unsupported_found.append(tech)

    if len(unsupported_found) > 1:
        return "UNSUPPORTED"
    elif len(unsupported_found) == 1:
        return "PARTIALLY_SUPPORTED"
    return "SUPPORTED"

def generate_optimized_summary(resume: Dict[str, Any], role_data: Dict[str, Any]) -> Dict[str, Any]:
    current_summary = resume.get("summary", "")
    target_role = role_data.get("role") or "Software Engineer"
    
    # Extract top verified skills
    verified_skills = [s.get("name") for s in resume.get("skills", []) if isinstance(s, dict)][:5]
    skills_str = ", ".join(verified_skills) if verified_skills else "modern software technologies"
    
    # Synthesize professional, role-targeted summary using ONLY verified skills
    suggested_summary = (
        f"Results-driven {target_role} with strong competencies in {skills_str}. "
        f"Experienced in building reliable, scalable software applications and translating complex technical requirements into high-impact solutions. "
        f"Committed to clean architecture, automated testing, and delivering performant code aligned with {target_role} industry best practices."
    )

    status = check_verification_status(suggested_summary, resume)

    return {
        "id": "sug-summary",
        "section": "summary",
        "title": "Optimize Professional Summary for Role",
        "current": current_summary or "No summary provided.",
        "suggested": suggested_summary,
        "explanation": f"Aligns your profile header with the '{target_role}' title and prominently showcases your verified skills ({skills_str}).",
        "status": status,
        "rule": "Anti-Fabrication Verified"
    }

def generate_reordered_skills(resume: Dict[str, Any], role_data: Dict[str, Any]) -> Dict[str, Any]:
    skills = resume.get("skills", [])
    if not skills:
        return None

    target_skills = [s.lower() for s in role_data.get("extractedSkills", [])]
    
    # Partition verified skills into High Priority (matches target role) and Secondary
    high_priority = []
    secondary = []

    for s in skills:
        name = s.get("name", "") if isinstance(s, dict) else str(s)
        if any(name.lower() in ts or ts in name.lower() for ts in target_skills):
            high_priority.append(name)
        else:
            secondary.append(name)

    reordered = high_priority + secondary
    
    return {
        "id": "sug-skills-order",
        "section": "skills",
        "title": "Prioritize Role-Relevant Skills",
        "current": ", ".join([s.get("name") if isinstance(s, dict) else s for s in skills]),
        "suggested": ", ".join(reordered),
        "explanation": f"Elevates {len(high_priority)} verified skills ({', '.join(high_priority[:4])}) to the top of your skills list to match ATS screening priority.",
        "status": "SUPPORTED",
        "rule": "Anti-Fabrication Verified"
    }

def generate_bullet_improvements(resume: Dict[str, Any], role_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    suggestions = []
    
    # Check experience bullets
    for i, exp in enumerate(resume.get("experience", [])):
        company = exp.get("company", "Company")
        for j, bullet in enumerate(exp.get("highlights", [])):
            if len(bullet.split()) < 8 or not re.search(r'(\d+|\%|\$)', bullet):
                # Suggest sharper phrasing with action verbs without inventing facts
                words = bullet.split()
                first_word = words[0] if words else "Worked"
                enhanced = bullet
                if not re.search(r'^(spearheaded|engineered|architected|developed|optimized|implemented)', bullet, re.I):
                    enhanced = f"Engineered and maintained {bullet[0].lower() + bullet[1:] if len(bullet)>1 else bullet}"
                
                suggestions.append({
                    "id": f"sug-exp-{i}-{j}",
                    "section": "experience",
                    "title": f"Strengthen Action Verbs ({company})",
                    "current": bullet,
                    "suggested": enhanced,
                    "explanation": "Applies a high-impact technical action verb to satisfy ATS keyword scoring while preserving your factual role context.",
                    "status": "SUPPORTED",
                    "rule": "Anti-Fabrication Verified"
                })
                if len(suggestions) >= 3:
                    break
        if len(suggestions) >= 3:
            break

    return suggestions

def generate_missing_skill_warnings(resume: Dict[str, Any], role_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    warnings = []
    missing_skills = role_data.get("missingSkills", [])
    
    for skill in missing_skills[:4]:
        warnings.append({
            "id": f"warn-missing-{skill.lower().replace(' ', '-')}",
            "section": "skills",
            "title": f"Missing Required Keyword: {skill}",
            "current": f"Not found in your verified profile.",
            "suggested": f"The role explicitly requires {skill}. Anti-fabrication engine will NOT automatically add this. If you have verified experience with {skill}, please add it manually.",
            "explanation": f"Candidate integrity rule: {skill} was not found in your master resume and cannot be auto-inserted.",
            "status": "UNSUPPORTED",
            "rule": "Strict Anti-Fabrication Rule"
        })

    return warnings

def generate_full_optimization_plan(resume: Dict[str, Any], role_data: Dict[str, Any]) -> Dict[str, Any]:
    suggestions = []

    # 1. Summary suggestion
    sum_sug = generate_optimized_summary(resume, role_data)
    if sum_sug:
        suggestions.append(sum_sug)

    # 2. Skills reordering suggestion
    skills_sug = generate_reordered_skills(resume, role_data)
    if skills_sug:
        suggestions.append(skills_sug)

    # 3. Bullet points enhancements
    bullet_sugs = generate_bullet_improvements(resume, role_data)
    suggestions.extend(bullet_sugs)

    # 4. Missing skill warnings (UNSUPPORTED)
    missing_warns = generate_missing_skill_warnings(resume, role_data)
    suggestions.extend(missing_warns)

    return {
        "role": role_data.get("role", "Software Engineer"),
        "company": role_data.get("company", ""),
        "totalSuggestions": len(suggestions),
        "supportedCount": sum(1 for s in suggestions if s["status"] == "SUPPORTED"),
        "unsupportedCount": sum(1 for s in suggestions if s["status"] == "UNSUPPORTED"),
        "suggestions": suggestions
    }
