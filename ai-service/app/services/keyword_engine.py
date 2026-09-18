import re
from typing import Dict, Any, List

# Semantic equivalency clusters
SEMANTIC_CLUSTERS = [
    {"rest api", "restful api", "restful web services", "rest", "api development", "backend api development"},
    {"postgres", "postgresql", "psql"},
    {"mongo", "mongodb"},
    {"react", "react.js", "reactjs"},
    {"node", "node.js", "nodejs"},
    {"express", "express.js"},
    {"docker", "containerization", "containers", "docker containers"},
    {"k8s", "kubernetes"},
    {"aws", "amazon web services"},
    {"gcp", "google cloud platform", "google cloud"},
    {"ci/cd", "continuous integration", "continuous deployment", "github actions", "jenkins"},
    {"unit testing", "automated testing", "jest", "pytest", "test driven development", "tdd"},
    {"microservices", "microservice architecture", "distributed systems"},
    {"git", "github", "gitlab", "version control"}
]

def find_semantic_match(keyword: str, text: str) -> tuple[bool, bool, str]:
    """
    Returns (is_exact, is_partial, note)
    """
    kw_lower = keyword.lower().strip()
    text_lower = text.lower()

    # 1. Exact match
    pattern = r'\b' + re.escape(kw_lower) + r'\b'
    if re.search(pattern, text_lower):
        return True, False, "Exact match verified in resume."

    # 2. Semantic cluster match
    for cluster in SEMANTIC_CLUSTERS:
        if kw_lower in cluster:
            for variant in cluster:
                if variant != kw_lower and re.search(r'\b' + re.escape(variant) + r'\b', text_lower):
                    return False, True, f"Semantically related match: '{variant}'"

    # 3. Substring / compound word match
    parts = kw_lower.split()
    if len(parts) > 1 and all(p in text_lower for p in parts):
        return False, True, "Component words found across resume."

    return False, False, "Keyword not detected."

def analyze_keywords_against_resume(resume: Dict[str, Any], role_data: Dict[str, Any]) -> Dict[str, Any]:
    # Flatten resume into searchable text
    resume_parts = []
    p = resume.get("personalInfo") or {}
    resume_parts.append(p.get("fullName", ""))
    resume_parts.append(resume.get("summary", ""))

    for s in resume.get("skills", []):
        if isinstance(s, dict):
            resume_parts.append(s.get("name", ""))
            resume_parts.append(s.get("category", ""))
        elif isinstance(s, str):
            resume_parts.append(s)

    for exp in resume.get("experience", []):
        resume_parts.append(exp.get("company", ""))
        resume_parts.append(exp.get("position", ""))
        resume_parts.extend(exp.get("highlights", []))

    for proj in resume.get("projects", []):
        resume_parts.append(proj.get("title", ""))
        resume_parts.append(proj.get("description", ""))
        resume_parts.extend(proj.get("technologies", []))
        resume_parts.extend(proj.get("highlights", []))

    resume_text = " ".join(resume_parts)

    all_target_skills = role_data.get("extractedSkills", [])
    required_set = set(s.lower() for s in role_data.get("requiredSkills", []))

    results = []
    matched_count = 0
    partial_count = 0
    missing_count = 0

    for skill in all_target_skills:
        exact, partial, note = find_semantic_match(skill, resume_text)
        
        # Determine importance
        importance = "High" if skill.lower() in required_set else "Medium"

        if exact:
            status = "MATCHED"
            matched_count += 1
        elif partial:
            status = "PARTIAL"
            partial_count += 1
        else:
            status = "MISSING"
            missing_count += 1

        results.append({
            "keyword": skill,
            "importance": importance,
            "status": status,
            "category": "Technical",
            "similarityNote": note
        })

    total = len(all_target_skills)
    match_pct = int(((matched_count * 1.0 + partial_count * 0.6) / max(1, total)) * 100) if total > 0 else 100

    return {
        "matchPercentage": match_pct,
        "matchedCount": matched_count,
        "partialCount": partial_count,
        "missingCount": missing_count,
        "totalCount": total,
        "keywords": results
    }
