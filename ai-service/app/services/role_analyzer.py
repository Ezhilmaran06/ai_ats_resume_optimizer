import re
from typing import Dict, Any, List, Set

TECH_DICTIONARY = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "golang", "go", "ruby", 
        "rust", "php", "sql", "scala", "swift", "kotlin", "r", "dart", "shell", "bash"
    ],
    "frameworks": [
        "react", "react.js", "next.js", "vue", "angular", "node.js", "nodejs", "express", 
        "express.js", "django", "fastapi", "spring boot", "spring", "flask", "asp.net", 
        ".net core", "laravel", "ruby on rails", "nest.js", "tailwind css", "bootstrap"
    ],
    "databases": [
        "mongodb", "postgresql", "postgres", "mysql", "redis", "elasticsearch", "cassandra", 
        "dynamodb", "oracle", "sqlite", "mariadb", "neo4j", "couchbase"
    ],
    "cloud_technologies": [
        "aws", "azure", "gcp", "google cloud platform", "docker", "kubernetes", "k8s", 
        "terraform", "ci/cd", "jenkins", "linux", "cloudformation", "ansible", "helm", 
        "serverless", "lambda", "ecs", "eks", "s3", "ec2"
    ],
    "tools": [
        "git", "github", "gitlab", "rest api", "graphql", "microservices", "jira", "agile", 
        "scrum", "unit testing", "jest", "pytest", "postman", "system design", "webpack", 
        "vite", "kafka", "rabbitmq", "prometheus", "grafana"
    ],
    "soft_skills": [
        "communication", "teamwork", "collaboration", "problem solving", "leadership", 
        "critical thinking", "time management", "adaptability", "analytical thinking", 
        "mentorship", "attention to detail", "initiative", "work ethic", "presentation"
    ],
    "certifications": [
        "aws certified", "aws solutions architect", "certified kubernetes administrator", 
        "cka", "azure certified", "gcp professional", "pmp", "cissp", "ceh", "comptia security+", 
        "scrum master", "csm"
    ]
}

ACTION_VERBS_LIST = [
    "spearheaded", "engineered", "architected", "developed", "optimized", "implemented", 
    "designed", "deployed", "refactored", "coordinated", "accelerated", "built", "maintained", 
    "automated", "integrated", "led", "mentored", "orchestrated", "scaled", "collaborated"
]

def format_skill_name(term: str) -> str:
    """Format technical skills with proper capitalization."""
    uppers = {"aws", "gcp", "sql", "api", "rest api", "ci/cd", "k8s", "ecs", "eks", "s3", "ec2", "pmp", "cka", "csm", "ceh"}
    if term.lower() in uppers:
        return term.upper()
    
    specials = {
        "react.js": "React.js",
        "next.js": "Next.js",
        "node.js": "Node.js",
        "express.js": "Express.js",
        "nest.js": "Nest.js",
        "spring boot": "Spring Boot",
        ".net core": ".NET Core",
        "asp.net": "ASP.NET",
        "fastapi": "FastAPI",
        "postgresql": "PostgreSQL",
        "mongodb": "MongoDB",
        "mysql": "MySQL",
        "sqlite": "SQLite",
        "dynamodb": "DynamoDB",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "github": "GitHub",
        "gitlab": "GitLab"
    }
    if term.lower() in specials:
        return specials[term.lower()]

    return term.title()

def extract_section_sentences(text: str, patterns: List[str]) -> List[str]:
    """Find lines that match specific heading contexts or bullet points."""
    matches = []
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    in_section = False
    
    for line in lines:
        lower = line.lower()
        if any(re.search(r'\b' + re.escape(p) + r'\b', lower) for p in patterns):
            in_section = True
            continue
        elif in_section and (lower.endswith(':') or re.match(r'^[A-Z\s]{4,}:?$', line)):
            in_section = False
        
        if in_section:
            cleaned = re.sub(r'^[•\-\*\–\d\.)\s]+', '', line).strip()
            if len(cleaned) > 8:
                matches.append(cleaned)
                
    return matches

def extract_education(text: str) -> List[str]:
    """Extract education requirements from text."""
    edu_results = []
    edu_patterns = [
        r"(?:bachelor'?s?|master'?s?|ph\.?d\.?|b\.?s\.?|m\.?s\.?|degree)\s+in\s+[^.,\n]+",
        r"(?:degree\s+in\s+computer\s+science[^\n.,]*)",
        r"(?:b\.?tech|b\.?e\.?)[^\n.,]*",
        r"(?:equivalent\s+practical\s+experience[^\n.,]*)"
    ]
    for pattern in edu_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for m in matches:
            found = m.group(0).strip()
            if len(found) > 6 and found not in edu_results:
                edu_results.append(found)
    
    if not edu_results:
        # Fallback keyword scan
        if "computer science" in text.lower():
            edu_results.append("Bachelor's or Master's degree in Computer Science or related field")
        elif "degree" in text.lower():
            edu_results.append("Relevant Bachelor's degree or equivalent practical experience")
            
    return edu_results[:3]

def extract_experience(text: str) -> List[str]:
    """Extract required experience and years from job text."""
    exp_results = []
    exp_patterns = [
        r"(\d+\+?\s*(?:to\s*\d+)?\s*(?:years?|yrs?)(?:\s+of)?\s+[^.,\n]{5,60})",
        r"(senior\s+level[^.,\n]*)",
        r"(entry\s+level[^.,\n]*)",
        r"(minimum\s+\d+\s+years?[^.,\n]*)"
    ]
    for pattern in exp_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for m in matches:
            found = m.group(0).strip()
            if len(found) > 5 and found not in exp_results:
                exp_results.append(found)
                
    if not exp_results:
        exp_results.append("3+ years of professional software engineering experience")
        
    return exp_results[:4]

def analyze_job_description(role_title: str, description: str, company: str = "") -> Dict[str, Any]:
    text_clean = description.strip()
    text_lower = text_clean.lower()
    
    # 1. Job Title Resolution
    final_title = role_title.strip() if role_title and role_title.strip() else ""
    if not final_title:
        # Attempt to infer from first line or common titles
        first_line = text_clean.split('\n')[0].strip()
        if len(first_line) < 60 and any(w in first_line.lower() for w in ["engineer", "developer", "architect", "lead", "manager", "designer", "analyst"]):
            final_title = re.sub(r'^[#\-•\s]+', '', first_line).split('—')[0].split('-')[0].strip()
        else:
            final_title = "Software Engineer"

    # 2. Extract categorized skills
    categorized_skills: Dict[str, List[str]] = {
        "programming_languages": [],
        "frameworks": [],
        "databases": [],
        "cloud_technologies": [],
        "tools": [],
        "soft_skills": [],
        "certifications": []
    }
    
    all_found_skills: List[str] = []
    
    for category, term_list in TECH_DICTIONARY.items():
        for term in term_list:
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, text_lower):
                formatted = format_skill_name(term)
                if formatted not in categorized_skills[category]:
                    categorized_skills[category].append(formatted)
                if formatted not in all_found_skills:
                    all_found_skills.append(formatted)

    # 3. Classify into Required vs Preferred vs Optional
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    optional_skills: List[str] = []

    paragraphs = text_clean.split('\n')
    current_classification = "Required"

    for p in paragraphs:
        p_clean = p.strip().lower()
        if not p_clean:
            continue
        if re.search(r'(nice to have|plus|bonus|optional)\b', p_clean):
            current_classification = "Optional"
        elif re.search(r'(preferred|preference|advantageous)\b', p_clean):
            current_classification = "Preferred"
        elif re.search(r'(required|must have|qualifications|requirements|minimum|core)\b', p_clean):
            current_classification = "Required"

        for skill in all_found_skills:
            if skill.lower() in p_clean:
                if current_classification == "Optional" and skill not in optional_skills:
                    optional_skills.append(skill)
                elif current_classification == "Preferred" and skill not in preferred_skills:
                    preferred_skills.append(skill)
                elif current_classification == "Required" and skill not in required_skills:
                    required_skills.append(skill)

    # Rebalance: default any uncategorized skill to Required if top tier, else Preferred
    for skill in all_found_skills:
        if skill not in required_skills and skill not in preferred_skills and skill not in optional_skills:
            required_skills.append(skill)

    # Clean up overlaps (if in required, remove from preferred/optional)
    preferred_skills = [s for s in preferred_skills if s not in required_skills]
    optional_skills = [s for s in optional_skills if s not in required_skills and s not in preferred_skills]

    # 4. Responsibilities Extraction
    responsibilities = []
    resp_sections = extract_section_sentences(text_clean, ["responsibilities", "what you will do", "duties", "role overview"])
    if resp_sections:
        responsibilities = resp_sections[:10]
    else:
        # Fallback to bulleted lines
        for line in paragraphs:
            cleaned = line.strip()
            if cleaned.startswith(('•', '-', '*', '–')) and len(cleaned) > 20:
                clean_bullet = re.sub(r'^[•\-\*\–\s]+', '', cleaned)
                responsibilities.append(clean_bullet)
                if len(responsibilities) >= 8:
                    break

    # 5. Education & Experience
    education = extract_education(text_clean)
    experience = extract_experience(text_clean)

    # 6. Action Verbs Extracted from JD
    found_action_verbs = []
    for verb in ACTION_VERBS_LIST:
        if re.search(r'\b' + re.escape(verb) + r'\b', text_lower):
            found_action_verbs.append(verb.capitalize())

    # 7. Domain & Technical Keywords
    domain_keywords = list(set(all_found_skills + found_action_verbs))
    
    # 8. Unified Classified Requirements Table
    classified_requirements = []
    for skill in required_skills:
        cat = next((k.replace('_', ' ').title() for k, v in categorized_skills.items() if skill in v), "Technical")
        classified_requirements.append({
            "name": skill,
            "category": cat,
            "classification": "Required",
            "importance": "High"
        })
    for skill in preferred_skills:
        cat = next((k.replace('_', ' ').title() for k, v in categorized_skills.items() if skill in v), "Technical")
        classified_requirements.append({
            "name": skill,
            "category": cat,
            "classification": "Preferred",
            "importance": "Medium"
        })
    for skill in optional_skills:
        cat = next((k.replace('_', ' ').title() for k, v in categorized_skills.items() if skill in v), "Technical")
        classified_requirements.append({
            "name": skill,
            "category": cat,
            "classification": "Optional",
            "importance": "Low"
        })

    return {
        "jobTitle": final_title,
        "company": company.strip() if company else "Target Company",
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills,
        "optionalSkills": optional_skills,
        "programmingLanguages": categorized_skills["programming_languages"],
        "frameworks": categorized_skills["frameworks"],
        "databases": categorized_skills["databases"],
        "cloudTechnologies": categorized_skills["cloud_technologies"],
        "tools": categorized_skills["tools"],
        "softSkills": categorized_skills["soft_skills"],
        "responsibilities": responsibilities,
        "education": education,
        "experience": experience,
        "certifications": categorized_skills["certifications"],
        "keywords": domain_keywords,
        "actionVerbs": found_action_verbs,
        "classifiedRequirements": classified_requirements,
        
        # Backward compatibility for existing UI and Node backend callers
        "role": final_title,
        "extractedSkills": all_found_skills,
        "techStack": {
            "languages": categorized_skills["programming_languages"],
            "frameworks": categorized_skills["frameworks"],
            "databases": categorized_skills["databases"],
            "cloud": categorized_skills["cloud_technologies"],
            "tools": categorized_skills["tools"]
        }
    }
