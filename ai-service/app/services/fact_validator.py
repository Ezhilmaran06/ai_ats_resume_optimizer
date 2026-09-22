import re
from typing import Dict, Any, List, Set, Tuple

def extract_candidate_fact_tokens(resume: Dict[str, Any]) -> Dict[str, Set[str]]:
    """
    Extracts all verified candidate claims:
    - verified_skills
    - verified_companies
    - verified_titles
    - verified_tools
    - verified_all_tokens
    """
    skills: Set[str] = set()
    companies: Set[str] = set()
    titles: Set[str] = set()
    all_tokens: Set[str] = set()

    # Personal info
    p = resume.get("personalInfo") or {}
    if p.get("professionalTitle"):
        titles.add(p.get("professionalTitle", "").lower().strip())
        all_tokens.add(p.get("professionalTitle", "").lower().strip())

    # Skills extraction
    raw_skills = resume.get("skills", [])
    if isinstance(raw_skills, dict):
        for cat, list_items in raw_skills.items():
            if isinstance(list_items, list):
                for item in list_items:
                    name = item.get("name") if isinstance(item, dict) else str(item)
                    if name:
                        cleaned = name.lower().strip()
                        skills.add(cleaned)
                        all_tokens.add(cleaned)
    elif isinstance(raw_skills, list):
        for s in raw_skills:
            name = s.get("name") if isinstance(s, dict) else str(s)
            if name:
                cleaned = name.lower().strip()
                skills.add(cleaned)
                all_tokens.add(cleaned)

    # Experience extraction
    for exp in resume.get("experience", []):
        if isinstance(exp, dict):
            if exp.get("company"):
                comp = exp.get("company", "").lower().strip()
                companies.add(comp)
                all_tokens.add(comp)
            pos = exp.get("position") or exp.get("role")
            if pos:
                titles.add(pos.lower().strip())
                all_tokens.add(pos.lower().strip())
            for t in exp.get("technologies", []):
                if t:
                    skills.add(str(t).lower().strip())
                    all_tokens.add(str(t).lower().strip())
            for h in (exp.get("highlights") or exp.get("achievements") or []):
                if isinstance(h, str):
                    for w in re.findall(r'\b[a-zA-Z0-9.+/-]{2,}\b', h.lower()):
                        all_tokens.add(w)

    # Projects extraction
    for proj in resume.get("projects", []):
        if isinstance(proj, dict):
            for t in proj.get("technologies", []):
                if t:
                    skills.add(str(t).lower().strip())
                    all_tokens.add(str(t).lower().strip())
            if proj.get("title") or proj.get("name"):
                name = (proj.get("title") or proj.get("name")).lower().strip()
                all_tokens.add(name)

    return {
        "skills": skills,
        "companies": companies,
        "titles": titles,
        "all_tokens": all_tokens
    }

def validate_suggestion_claims(suggestion: Dict[str, Any], candidate_facts: Dict[str, Set[str]]) -> Tuple[str, str, List[str]]:
    """
    Validates an AI generated suggestion against candidate verified facts.
    Returns (status: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED', rule: str, missing_entities: List[str])
    """
    proposed_text = (suggestion.get("suggested") or "").lower()
    if not proposed_text:
        return ("SUPPORTED", "No claims asserted.", [])

    # If already an explicit missing skill alert
    if suggestion.get("status") == "UNSUPPORTED" or "Missing Required" in suggestion.get("title", ""):
        return ("UNSUPPORTED", "Never automatically add. Missing from verified profile.", [suggestion.get("title", "")])

    verified_skills = candidate_facts["skills"]
    all_tokens = candidate_facts["all_tokens"]

    # High-impact hard technical skills that MUST be strictly verified
    strict_tech_checks = [
        "aws", "azure", "gcp", "kubernetes", "docker", "spark", "kafka", 
        "graphql", "spring boot", "react", "angular", "ci/cd", "terraform",
        "redis", "elasticsearch", "cassandra", "dynamodb", "mongodb",
        "postgresql", "python", "java", "golang", "c++", "c#"
    ]

    unsupported_found = []
    for tech in strict_tech_checks:
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(tech) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, proposed_text):
            # Check if verified in candidate facts
            is_verified = any(tech in v or v in tech for v in verified_skills)
            if not is_verified:
                unsupported_found.append(tech.upper())

    if len(unsupported_found) > 0:
        return (
            "UNSUPPORTED",
            f"Never automatically add. Contains unverified technical skills: {', '.join(unsupported_found)}.",
            unsupported_found
        )

    # Check for metrics or quantifiable numbers in proposed text that did not exist in original
    original_text = (suggestion.get("current") or suggestion.get("original") or "").lower()
    proposed_numbers = set(re.findall(r'\b\d+(?:%|\+?k?|\+)?\b', proposed_text))
    original_numbers = set(re.findall(r'\b\d+(?:%|\+?k?|\+)?\b', original_text))

    fabricated_numbers = proposed_numbers - original_numbers
    # If it invents a new specific metric percentage or dollar figure, require confirmation
    if any(('%' in n or '$' in n) for n in fabricated_numbers):
        return (
            "PARTIALLY_SUPPORTED",
            "Require user confirmation: Suggestion contains enhanced quantitative phrasing not in original bullet.",
            list(fabricated_numbers)
        )

    # If suggestion rewrites or reorders existing verified facts
    return (
        "SUPPORTED",
        "Can be suggested: Grounded in candidate verified data.",
        []
    )

def validate_all_suggestions(suggestions: List[Dict[str, Any]], resume: Dict[str, Any], role_data: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Validation layer: Every AI-generated suggestion must be classified:
    - SUPPORTED (Can be suggested)
    - PARTIALLY SUPPORTED (Require user confirmation)
    - UNSUPPORTED (Never automatically add)
    """
    candidate_facts = extract_candidate_fact_tokens(resume)
    validated = []

    for s in suggestions:
        item = dict(s)
        status, rule_desc, unverified_items = validate_suggestion_claims(item, candidate_facts)
        
        item["status"] = status
        item["validationRule"] = rule_desc
        item["unverifiedClaims"] = unverified_items
        
        if status == "SUPPORTED":
            item["validationAction"] = "Can be suggested"
        elif status == "PARTIALLY_SUPPORTED":
            item["validationAction"] = "Require user confirmation"
        else:
            item["validationAction"] = "Never automatically add"
            
        validated.append(item)

    return validated
