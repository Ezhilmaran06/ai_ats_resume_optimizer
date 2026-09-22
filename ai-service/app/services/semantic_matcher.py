import re
from typing import Dict, Any, List, Tuple
from app.services.keyword_engine import extract_all_resume_tokens, SEMANTIC_CLUSTERS
from app.services.role_analyzer import analyze_job_description

def evaluate_semantic_skill_match(target_skill: str, resume_tokens: str, raw_resume: Dict[str, Any]) -> Tuple[str, str, str, str]:
    """
    Returns (status: 'MATCHED'|'PARTIAL'|'MISSING', match_type: 'Exact'|'Semantic'|'Partial'|'None', matched_with: str, explanation: str)
    """
    t_lower = target_skill.lower().strip()
    text_lower = resume_tokens.lower()

    # 1. Exact match check
    exact_pattern = r'(?<![a-zA-Z0-9])' + re.escape(t_lower) + r'(?![a-zA-Z0-9])'
    if re.search(exact_pattern, text_lower):
        return (
            "MATCHED", 
            "Exact", 
            target_skill, 
            f"Exact match verified: '{target_skill}' found in candidate profile."
        )

    # 2. Semantic Cluster match (e.g. 'RESTful Web Services' matches 'REST APIs')
    for cluster in SEMANTIC_CLUSTERS:
        # Check if target skill belongs to cluster or has overlap
        matches_cluster = t_lower in cluster or any(
            (c in t_lower or t_lower in c) for c in cluster if len(c) > 3
        )
        if matches_cluster:
            for variant in cluster:
                if variant != t_lower:
                    var_pattern = r'(?<![a-zA-Z0-9])' + re.escape(variant) + r'(?![a-zA-Z0-9])'
                    if re.search(var_pattern, text_lower):
                        return (
                            "MATCHED", 
                            "Semantic", 
                            variant, 
                            f"Semantic match: '{variant}' in resume matches target requirement '{target_skill}'."
                        )

    # 3. Component / Partial match
    parts = [p for p in re.split(r'[\s\-_/]+', t_lower) if len(p) > 2]
    if len(parts) > 1:
        matched_parts = [p for p in parts if p in text_lower]
        if len(matched_parts) == len(parts):
            return (
                "PARTIAL", 
                "Partial", 
                " & ".join(matched_parts), 
                f"Partial match: Compound components ({', '.join(matched_parts)}) present across resume."
            )
        elif len(matched_parts) >= 1:
            return (
                "PARTIAL", 
                "Partial", 
                matched_parts[0], 
                f"Partial match: Related competency ({matched_parts[0]}) detected."
            )

    if t_lower in text_lower and len(t_lower) >= 4:
        return (
            "PARTIAL", 
            "Partial", 
            target_skill, 
            f"Partial match: Contextual mention detected."
        )

    # 4. Missing - Explicitly NOT added
    return (
        "MISSING", 
        "None", 
        "", 
        f"Missing requirement: '{target_skill}' not found in verified resume. Anti-fabrication rule: Skill is NOT injected."
    )

def perform_resume_role_matching(resume: Dict[str, Any], role_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compares User Resume VS Job Requirements using semantic matching.
    Returns:
    - matched skills
    - partial skills
    - missing skills
    - match percentage
    - explanations
    Rule: Never adds missing skills to the resume.
    """
    resume_tokens = extract_all_resume_tokens(resume)

    # Resolve target requirements
    extracted_skills = role_data.get("extractedSkills") or []
    if not extracted_skills:
        if role_data.get("description") or role_data.get("rawText"):
            jd_text = role_data.get("description") or role_data.get("rawText")
            analysis = analyze_job_description(role_data.get("role", "Software Engineer"), jd_text)
            extracted_skills = analysis.get("extractedSkills", [])
            role_data["requiredSkills"] = analysis.get("requiredSkills", [])
            role_data["preferredSkills"] = analysis.get("preferredSkills", [])
        else:
            extracted_skills = role_data.get("requiredSkills", []) + role_data.get("preferredSkills", [])

    seen = set()
    unique_skills = []
    for s in extracted_skills:
        name = s.get("name") if isinstance(s, dict) else str(s).strip()
        if name and name.lower() not in seen:
            seen.add(name.lower())
            unique_skills.append(name)

    matched_skills = []
    partial_skills = []
    missing_skills = []
    explanations = {}

    for skill in unique_skills:
        status, match_type, matched_with, explanation = evaluate_semantic_skill_match(skill, resume_tokens, resume)
        explanations[skill] = explanation

        skill_item = {
            "name": skill,
            "skill": skill,
            "status": status,
            "matchType": match_type,
            "matchedWith": matched_with,
            "explanation": explanation
        }

        if status == "MATCHED":
            matched_skills.append(skill_item)
        elif status == "PARTIAL":
            partial_skills.append(skill_item)
        else:
            missing_skills.append(skill_item)

    total = len(unique_skills)
    match_percentage = int(((len(matched_skills) * 1.0 + len(partial_skills) * 0.5) / max(1, total)) * 100) if total > 0 else 100

    return {
        # CamelCase
        "matchedSkills": matched_skills,
        "partialSkills": partial_skills,
        "missingSkills": missing_skills,
        "matchPercentage": match_percentage,
        "explanations": explanations,
        "totalRequirements": total,
        
        # Snake_case compatibility
        "matched_skills": matched_skills,
        "partial_skills": partial_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
        
        # Integrity verification guarantee
        "integrityCheck": {
            "missingSkillsInjected": False,
            "rule": "Anti-Fabrication Policy: Missing skills are never automatically added to candidate resume."
        }
    }
