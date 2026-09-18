import re
from typing import Dict, Any, List

TECH_DICTIONARY = {
    "languages": ["python", "java", "javascript", "typescript", "c++", "c#", "golang", "go", "ruby", "rust", "php", "sql", "scala"],
    "frameworks": ["react", "react.js", "next.js", "vue", "angular", "node.js", "nodejs", "express", "django", "fastapi", "spring boot", "spring", "flask"],
    "databases": ["mongodb", "postgresql", "postgres", "mysql", "redis", "elasticsearch", "cassandra", "dynamodb", "oracle"],
    "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "jenkins", "linux"],
    "tools": ["git", "rest api", "graphql", "microservices", "jira", "agile", "unit testing", "system design"]
}

def analyze_job_description(role_title: str, description: str, company: str = "") -> Dict[str, Any]:
    text_lower = description.lower()
    
    extracted_tech: Dict[str, List[str]] = {
        "languages": [], "frameworks": [], "databases": [], "cloud": [], "tools": []
    }

    all_found_skills = []

    for cat, terms in TECH_DICTIONARY.items():
        for term in terms:
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, text_lower):
                disp_term = term.title() if len(term) > 3 and term not in ["aws", "gcp", "sql", "api"] else term.upper()
                if disp_term not in extracted_tech[cat]:
                    extracted_tech[cat].append(disp_term)
                    all_found_skills.append(disp_term)

    # Detect Required vs Preferred
    required_skills = []
    preferred_skills = []
    
    # Split description into sections
    paragraphs = description.split('\n')
    current_req_type = "required"

    for p in paragraphs:
        p_clean = p.strip().lower()
        if not p_clean:
            continue
        if re.search(r'(preferred|nice to have|plus|bonus|optional)\b', p_clean):
            current_req_type = "preferred"
        elif re.search(r'(required|must have|qualifications|requirements|minimum)\b', p_clean):
            current_req_type = "required"
        
        # Check which skills appear in this paragraph
        for skill in all_found_skills:
            if skill.lower() in p_clean:
                if current_req_type == "preferred" and skill not in preferred_skills:
                    preferred_skills.append(skill)
                elif current_req_type == "required" and skill not in required_skills:
                    required_skills.append(skill)

    # Default leftover skills to required
    for skill in all_found_skills:
        if skill not in required_skills and skill not in preferred_skills:
            required_skills.append(skill)

    # Responsibilities extraction
    responsibilities = []
    for line in paragraphs:
        cleaned = line.strip()
        if cleaned.startswith(('•', '-', '*', '–')) and len(cleaned) > 15:
            responsibilities.append(re.sub(r'^[•\-\*\–\s]+', '', cleaned))

    return {
        "role": role_title or "Software Engineer",
        "company": company or "Target Company",
        "extractedSkills": all_found_skills,
        "requiredSkills": required_skills[:12],
        "preferredSkills": preferred_skills[:8],
        "techStack": extracted_tech,
        "responsibilities": responsibilities[:8]
    }
