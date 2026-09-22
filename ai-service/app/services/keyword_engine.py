import re
from typing import Dict, Any, List, Tuple

# Comprehensive Semantic Equivalency Clusters
SEMANTIC_CLUSTERS = [
    {"java", "core java", "java 11", "java 17", "java 21", "jvm", "java se", "java ee"},
    {"python", "python3", "python 3", "py"},
    {"javascript", "js", "ecmascript", "es6", "es2020", "vanilla js"},
    {"typescript", "ts"},
    {"c++", "cpp"},
    {"c#", "csharp", ".net", "dotnet", ".net core"},
    {"golang", "go programming", "go language", "go"},
    {"ruby", "ruby on rails", "rails"},
    {"rust", "rustlang"},
    {"php", "modern php", "laravel", "symfony"},
    {"react", "react.js", "reactjs", "react framework", "react ecosystem"},
    {"next.js", "nextjs", "next"},
    {"vue", "vue.js", "vuejs"},
    {"angular", "angularjs", "angular 2+"},
    {"node", "node.js", "nodejs", "node runtime"},
    {"express", "express.js", "expressjs"},
    {"fastapi", "fast api"},
    {"spring", "spring boot", "spring framework"},
    {"django", "django rest framework", "drf"},
    {"flask", "flask microframework"},
    {"rest api", "restful api", "restful web services", "rest", "api development", "backend api development", "web apis", "rest apis", "restful services"},
    {"graphql", "apollo graphql", "graphql api"},
    {"postgres", "postgresql", "psql"},
    {"mongo", "mongodb", "document database"},
    {"redis", "redis cache", "in-memory caching"},
    {"mysql", "mariadb"},
    {"docker", "containerization", "containers", "docker containers", "dockerfile", "docker compose"},
    {"k8s", "kubernetes", "k8s cluster", "container orchestration"},
    {"aws", "amazon web services", "aws cloud", "aws ec2", "aws s3", "aws lambda", "cloud infrastructure (aws)"},
    {"gcp", "google cloud platform", "google cloud"},
    {"azure", "microsoft azure", "azure cloud"},
    {"ci/cd", "continuous integration", "continuous deployment", "github actions", "jenkins", "gitlab ci", "ci / cd"},
    {"unit testing", "automated testing", "jest", "pytest", "test driven development", "tdd", "mocha", "junit", "integration testing"},
    {"microservices", "microservice architecture", "distributed systems", "service oriented architecture", "micro-services"},
    {"git", "github", "gitlab", "version control", "git workflows", "vcs"},
    {"sql", "relational database", "rdbms", "structured query language"},
    {"nosql", "non-relational database"},
    {"agile", "scrum", "kanban", "sprints", "agile development"},
    {"system design", "distributed systems", "software architecture", "high availability", "scalability"}
]

def find_semantic_match(keyword: str, text: str) -> Tuple[bool, bool, str]:
    """
    Evaluates exact match, semantic cluster match, or partial match against normalized text.
    Returns: (is_exact, is_partial, note)
    """
    kw_clean = keyword.lower().strip()
    text_lower = text.lower()

    # 1. Exact string boundary match
    pattern = r'(?<![a-zA-Z0-9])' + re.escape(kw_clean) + r'(?![a-zA-Z0-9])'
    if re.search(pattern, text_lower):
        return True, False, "Exact match verified in resume."

    # 2. Semantic cluster equivalency
    for cluster in SEMANTIC_CLUSTERS:
        if kw_clean in cluster:
            for variant in cluster:
                if variant != kw_clean and re.search(r'(?<![a-zA-Z0-9])' + re.escape(variant) + r'(?![a-zA-Z0-9])', text_lower):
                    return True, False, f"Equivalent verified via '{variant}'"

    # 3. Partial / Related / Substring match
    parts = [p for p in re.split(r'[\s\-_/]+', kw_clean) if len(p) > 2]
    if len(parts) > 1:
        matched_parts = [p for p in parts if p in text_lower]
        if len(matched_parts) == len(parts):
            return False, True, f"Compound keywords found ({', '.join(matched_parts)})"
        elif len(matched_parts) >= 1:
            return False, True, f"Partial component match ({', '.join(matched_parts)})"

    # 4. Check if keyword is in text without strict boundary (e.g. compound word)
    if kw_clean in text_lower and len(kw_clean) >= 4:
        return False, True, f"Related mention detected in resume text"

    return False, False, "Not detected in candidate profile."

def extract_all_resume_tokens(resume: Dict[str, Any]) -> str:
    """Extract and flatten all text from resume across all schema variations."""
    tokens = []
    
    # Personal Info & Summary
    p = resume.get("personalInfo") or {}
    tokens.append(p.get("fullName", ""))
    tokens.append(p.get("professionalTitle", ""))
    tokens.append(resume.get("summary", ""))

    # Skills - handles dict with category keys, list of dicts, or list of strings
    skills = resume.get("skills", [])
    if isinstance(skills, dict):
        for cat, items in skills.items():
            if isinstance(items, list):
                for it in items:
                    tokens.append(it.get("name", "") if isinstance(it, dict) else str(it))
            elif isinstance(items, str):
                tokens.append(items)
    elif isinstance(skills, list):
        for s in skills:
            if isinstance(s, dict):
                tokens.append(s.get("name", ""))
                tokens.append(s.get("category", ""))
            elif isinstance(s, str):
                tokens.append(s)

    # Experience
    for exp in resume.get("experience", []):
        if isinstance(exp, dict):
            tokens.append(exp.get("company", ""))
            tokens.append(exp.get("position", "") or exp.get("role", ""))
            tokens.append(exp.get("description", ""))
            tokens.extend(exp.get("highlights", []) if isinstance(exp.get("highlights"), list) else [])
            tokens.extend(exp.get("achievements", []) if isinstance(exp.get("achievements"), list) else [])

    # Projects
    for proj in resume.get("projects", []):
        if isinstance(proj, dict):
            tokens.append(proj.get("title", "") or proj.get("name", ""))
            tokens.append(proj.get("description", ""))
            tokens.extend(proj.get("technologies", []) if isinstance(proj.get("technologies"), list) else [])
            tokens.extend(proj.get("highlights", []) if isinstance(proj.get("highlights"), list) else [])

    # Education & Certifications
    for edu in resume.get("education", []):
        if isinstance(edu, dict):
            tokens.append(edu.get("institution", "") or edu.get("school", ""))
            tokens.append(edu.get("degree", ""))
            tokens.append(edu.get("fieldOfStudy", ""))
            
    for cert in resume.get("certifications", []):
        if isinstance(cert, dict):
            tokens.append(cert.get("name", ""))
        elif isinstance(cert, str):
            tokens.append(cert)

    return " ".join([t for t in tokens if t])

def analyze_keywords_against_resume(resume: Dict[str, Any], role_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Keyword analysis engine evaluating MATCHED (✓), PARTIAL (⚠), and MISSING (✕).
    Identifies High importance, Medium importance, and Low importance.
    Uses semantic matching and does not rely on simple exact string counting.
    """
    resume_text = extract_all_resume_tokens(resume)

    # Resolve target skills and importance sets
    all_target_skills = role_data.get("extractedSkills") or []
    if not all_target_skills:
        all_target_skills = (role_data.get("requiredSkills", []) + 
                             role_data.get("preferredSkills", []) + 
                             role_data.get("optionalSkills", []))

    # Remove duplicates preserving order
    seen = set()
    unique_target_skills = []
    for s in all_target_skills:
        s_name = s.get("name") if isinstance(s, dict) else str(s)
        if s_name and s_name.lower() not in seen:
            seen.add(s_name.lower())
            unique_target_skills.append(s_name)

    required_set = set(
        (s.get("name").lower() if isinstance(s, dict) else str(s).lower())
        for s in role_data.get("requiredSkills", [])
    )
    preferred_set = set(
        (s.get("name").lower() if isinstance(s, dict) else str(s).lower())
        for s in role_data.get("preferredSkills", [])
    )
    optional_set = set(
        (s.get("name").lower() if isinstance(s, dict) else str(s).lower())
        for s in role_data.get("optionalSkills", [])
    )

    results = []
    matched_count = 0
    partial_count = 0
    missing_count = 0

    for skill in unique_target_skills:
        exact, partial, note = find_semantic_match(skill, resume_text)
        s_lower = skill.lower()

        # Determine Importance: High, Medium, Low
        if s_lower in required_set:
            importance = "High"
        elif s_lower in preferred_set:
            importance = "Medium"
        elif s_lower in optional_set:
            importance = "Low"
        else:
            # Heuristic default: core languages/frameworks are High, others Medium
            importance = "High" if len(results) < 5 else "Medium"

        if exact:
            status = "MATCHED"
            symbol = "✓"
            matched_count += 1
        elif partial:
            status = "PARTIAL"
            symbol = "⚠"
            partial_count += 1
        else:
            status = "MISSING"
            symbol = "✕"
            missing_count += 1

        results.append({
            "keyword": skill,
            "status": status,
            "symbol": symbol,
            "importance": importance,
            "importanceLabel": f"{importance} importance",
            "category": "Technical",
            "similarityNote": note
        })

    # Sort results: MATCHED then PARTIAL then MISSING, grouped by High -> Medium -> Low importance
    importance_rank = {"High": 0, "Medium": 1, "Low": 2}
    status_rank = {"MATCHED": 0, "PARTIAL": 1, "MISSING": 2}
    results.sort(key=lambda x: (status_rank.get(x["status"], 3), importance_rank.get(x["importance"], 3)))

    total = len(results)
    # Calculate match percentage: matched full weight, partial 50%
    match_pct = int(((matched_count * 1.0 + partial_count * 0.5) / max(1, total)) * 100) if total > 0 else 100

    return {
        "matchPercentage": match_pct,
        "matchedCount": matched_count,
        "partialCount": partial_count,
        "missingCount": missing_count,
        "totalCount": total,
        "keywords": results
    }
