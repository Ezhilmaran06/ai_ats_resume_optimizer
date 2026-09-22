import re
from typing import Any, Dict, List, Optional

def normalize_string(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, str):
        return val.strip()
    return str(val).strip()

def normalize_list_of_strings(val: Any) -> List[str]:
    if not val:
        return []
    if isinstance(val, list):
        result = []
        for item in val:
            if isinstance(item, str) and item.strip():
                result.append(item.strip())
            elif isinstance(item, dict):
                # If dict has 'name', 'title', or single value
                text = item.get("name") or item.get("title") or item.get("value") or ""
                if text:
                    result.append(str(text).strip())
            elif item is not None:
                str_item = str(item).strip()
                if str_item:
                    result.append(str_item)
        return result
    if isinstance(val, str):
        # Could be comma-separated or newline-separated
        split_items = re.split(r'[,;\n•]+', val)
        return [item.strip() for item in split_items if item.strip()]
    if isinstance(val, dict):
        # Extract values
        items = []
        for sub_val in val.values():
            if isinstance(sub_val, list):
                items.extend(normalize_list_of_strings(sub_val))
            elif isinstance(sub_val, str) and sub_val.strip():
                items.append(sub_val.strip())
        return list(dict.fromkeys(items))
    return []

def categorize_skills(skills_input: Any) -> Dict[str, List[str]]:
    """Return categorized skill map for resume layouts."""
    categories = {
        "programmingLanguages": [],
        "frameworks": [],
        "databases": [],
        "cloud": [],
        "tools": [],
        "softSkills": [],
        "other": []
    }
    
    if isinstance(skills_input, dict):
        for k, v in skills_input.items():
            if k in categories:
                categories[k] = normalize_list_of_strings(v)
            elif k.lower() in ["languages", "programming", "programminglanguages"]:
                categories["programmingLanguages"].extend(normalize_list_of_strings(v))
            elif k.lower() in ["frameworks", "libraries"]:
                categories["frameworks"].extend(normalize_list_of_strings(v))
            elif k.lower() in ["databases", "database"]:
                categories["databases"].extend(normalize_list_of_strings(v))
            elif k.lower() in ["cloud", "devops", "cloud & devops"]:
                categories["cloud"].extend(normalize_list_of_strings(v))
            elif k.lower() in ["tools", "developer tools", "tools & architecture"]:
                categories["tools"].extend(normalize_list_of_strings(v))
            elif k.lower() in ["soft", "softskills", "interpersonal"]:
                categories["softSkills"].extend(normalize_list_of_strings(v))
            else:
                categories["other"].extend(normalize_list_of_strings(v))
        # Deduplicate
        for k in categories:
            categories[k] = list(dict.fromkeys(categories[k]))
        return categories

    # If it's a list of dicts with {name, category} or list of strings
    raw_list = []
    if isinstance(skills_input, list):
        for item in skills_input:
            if isinstance(item, dict):
                name = item.get("name") or item.get("title") or ""
                cat = (item.get("category") or "other").lower()
                if not name:
                    continue
                name = str(name).strip()
                if "program" in cat or "language" in cat:
                    categories["programmingLanguages"].append(name)
                elif "framework" in cat or "lib" in cat:
                    categories["frameworks"].append(name)
                elif "data" in cat or "sql" in cat:
                    categories["databases"].append(name)
                elif "cloud" in cat or "devops" in cat or "aws" in cat:
                    categories["cloud"].append(name)
                elif "tool" in cat:
                    categories["tools"].append(name)
                elif "soft" in cat:
                    categories["softSkills"].append(name)
                else:
                    categories["other"].append(name)
            elif isinstance(item, str) and item.strip():
                raw_list.append(item.strip())
    elif isinstance(skills_input, str):
        raw_list = normalize_list_of_strings(skills_input)

    # Heuristic categorization for plain string skills
    for s in raw_list:
        low = s.lower()
        if low in ["python", "java", "javascript", "typescript", "c++", "c#", "go", "golang", "ruby", "rust", "php", "sql", "r", "html", "css", "bash"]:
            categories["programmingLanguages"].append(s)
        elif low in ["react", "react.js", "next.js", "vue", "angular", "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring boot", "redux"]:
            categories["frameworks"].append(s)
        elif low in ["mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "elasticsearch"]:
            categories["databases"].append(s)
        elif low in ["aws", "azure", "gcp", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "jenkins"]:
            categories["cloud"].append(s)
        elif low in ["git", "github", "jira", "postman", "linux", "agile", "scrum", "rest api"]:
            categories["tools"].append(s)
        elif low in ["leadership", "communication", "teamwork", "problem solving", "time management"]:
            categories["softSkills"].append(s)
        else:
            categories["other"].append(s)

    for k in categories:
        categories[k] = list(dict.fromkeys(categories[k]))
    return categories

def normalize_skills(skills_input: Any) -> List[Dict[str, str]]:
    """Return flat list of skill dicts: [{'name': 'Python', 'category': 'Programming', 'level': 'Intermediate'}, ...]"""
    if not skills_input:
        return []
    
    cat_map = categorize_skills(skills_input)
    result = []
    category_labels = {
        "programmingLanguages": "Programming",
        "frameworks": "Frameworks",
        "databases": "Databases",
        "cloud": "Cloud & DevOps",
        "tools": "Tools & Architecture",
        "softSkills": "Soft Skills",
        "other": "Technical"
    }

    seen = set()
    for cat_key, label in category_labels.items():
        for skill_name in cat_map.get(cat_key, []):
            if skill_name.lower() not in seen:
                seen.add(skill_name.lower())
                result.append({
                    "name": skill_name,
                    "category": label,
                    "level": "Intermediate"
                })
    return result

def normalize_personal_info(val: Any) -> Dict[str, Any]:
    if not isinstance(val, dict):
        val = {}
    return {
        "fullName": normalize_string(val.get("fullName") or val.get("name")),
        "professionalTitle": normalize_string(val.get("professionalTitle") or val.get("title")),
        "email": normalize_string(val.get("email")),
        "phone": normalize_string(val.get("phone")),
        "location": normalize_string(val.get("location")),
        "linkedin": normalize_string(val.get("linkedin")),
        "github": normalize_string(val.get("github")),
        "portfolio": normalize_string(val.get("portfolio")),
        "links": normalize_links(val.get("links") or val.get("otherLinks"))
    }

def normalize_links(val: Any) -> List[Dict[str, str]]:
    if not val:
        return []
    result = []
    if isinstance(val, list):
        for item in val:
            if isinstance(item, dict):
                label = normalize_string(item.get("label") or item.get("name") or "Link")
                url = normalize_string(item.get("url") or item.get("link") or item.get("href"))
                if url:
                    result.append({"label": label, "url": url})
            elif isinstance(item, str) and item.strip():
                result.append({"label": "Link", "url": item.strip()})
    return result

def normalize_education(val: Any) -> List[Dict[str, Any]]:
    if not isinstance(val, list):
        return []
    result = []
    for item in val:
        if not isinstance(item, dict):
            continue
        result.append({
            "institution": normalize_string(item.get("institution") or item.get("school") or item.get("university")),
            "degree": normalize_string(item.get("degree")),
            "field": normalize_string(item.get("field") or item.get("major")),
            "startDate": normalize_string(item.get("startDate")),
            "endDate": normalize_string(item.get("endDate") or item.get("graduationDate")),
            "cgpa": normalize_string(item.get("cgpa") or item.get("gpa")),
            "description": normalize_string(item.get("description")),
            "highlights": normalize_list_of_strings(item.get("highlights"))
        })
    return result

def normalize_experience(val: Any) -> List[Dict[str, Any]]:
    if not isinstance(val, list):
        return []
    result = []
    for item in val:
        if not isinstance(item, dict):
            continue
        highlights = normalize_list_of_strings(item.get("highlights") or item.get("achievements"))
        result.append({
            "company": normalize_string(item.get("company") or item.get("employer")),
            "role": normalize_string(item.get("role") or item.get("position") or item.get("title")),
            "position": normalize_string(item.get("position") or item.get("role") or item.get("title")),
            "location": normalize_string(item.get("location")),
            "startDate": normalize_string(item.get("startDate")),
            "endDate": normalize_string(item.get("endDate") or "Present"),
            "currentlyWorking": bool(item.get("currentlyWorking") or item.get("current") or False),
            "description": normalize_string(item.get("description")),
            "highlights": highlights,
            "achievements": highlights,
            "technologies": normalize_list_of_strings(item.get("technologies") or item.get("skills"))
        })
    return result

def normalize_projects(val: Any) -> List[Dict[str, Any]]:
    if not isinstance(val, list):
        return []
    result = []
    for item in val:
        if not isinstance(item, dict):
            continue
        highlights = normalize_list_of_strings(item.get("highlights") or item.get("achievements"))
        result.append({
            "name": normalize_string(item.get("name") or item.get("title") or "Project"),
            "title": normalize_string(item.get("title") or item.get("name") or "Project"),
            "description": normalize_string(item.get("description")),
            "technologies": normalize_list_of_strings(item.get("technologies") or item.get("techStack")),
            "highlights": highlights,
            "achievements": highlights,
            "url": normalize_string(item.get("url") or item.get("link"))
        })
    return result

def normalize_parsed_resume(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Guarantees a clean, standardized resume structure matching Step 3 requirements."""
    structured = raw.get("structured", raw)
    personal = normalize_personal_info(structured.get("personalInfo", structured.get("personal", {})))
    flat_skills = normalize_skills(structured.get("skills"))
    cat_skills = categorize_skills(structured.get("skills"))
    
    # Simple list of skill names for Step 3 API contract ("skills": ["Python", "React", ...])
    skill_names = [s["name"] for s in flat_skills]

    return {
        "title": normalize_string(structured.get("title")) or f"{personal.get('fullName', 'Candidate')} Resume",
        "templateId": normalize_string(structured.get("templateId")) or "ats-classic",
        "personal": personal,
        "personalInfo": personal,
        "summary": normalize_string(structured.get("summary")),
        "skills": skill_names,
        "skillsList": flat_skills,
        "skillsCategories": cat_skills,
        "education": normalize_education(structured.get("education")),
        "experience": normalize_experience(structured.get("experience")),
        "projects": normalize_projects(structured.get("projects")),
        "certifications": normalize_list_of_strings(structured.get("certifications")),
        "achievements": normalize_list_of_strings(structured.get("achievements")),
        "languages": normalize_list_of_strings(structured.get("languages")),
        "links": personal.get("links", [])
    }
