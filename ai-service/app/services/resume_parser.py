import re
from typing import Dict, Any, List, Optional
from app.utils.text_extractor import extract_text, extract_text_from_pdf, extract_text_from_docx, extract_text_from_txt

COMMON_TECH_SKILLS = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang", "ruby", "rust", "php", "swift", "kotlin", "sql", "r", "html", "css", "html5", "css3", "bash", "shell",
    # Frameworks & Libraries
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi", "spring", "spring boot", "asp.net", ".net", "laravel", "rails", "jquery", "redux", "tailwind", "bootstrap",
    # Databases
    "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "elasticsearch", "cassandra", "dynamodb", "oracle", "mariadb", "firebase", "supabase",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "jenkins", "github actions", "gitlab", "ansible", "nginx", "linux", "unix",
    # Tools & Concepts
    "git", "rest", "rest api", "restful", "graphql", "microservices", "agile", "scrum", "jira", "postman", "unit testing", "pytest", "jest", "oop", "system design", "jwt", "oauth"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text.append(page_text)
    return "\n".join(text)

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)

def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode('utf-8', errors='ignore')

def extract_contact_info(text: str) -> Dict[str, Any]:
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', text)
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+', text, re.I)
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+', text, re.I)
    portfolio_match = re.search(r'(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:io|me|dev|app|tech|co|com)(?:\/[^\s]*)?', text, re.I)

    # Location pattern (e.g. City, State or City, Country)
    location_match = re.search(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?|[A-Z][a-zA-Z\s]+,\s*(?:USA|India|Canada|UK|Germany|Remote))\b', text)
    
    # Try finding candidate name from early lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    full_name = ""
    for line in lines[:5]:
        # Filter out email/phone/urls
        if not re.search(r'(@|http|www|\d{5,})', line) and len(line.split()) <= 4 and len(line) > 2:
            full_name = line
            break

    links = []
    if linkedin_match:
        links.append({"label": "LinkedIn", "url": linkedin_match.group(0)})
    if github_match:
        links.append({"label": "GitHub", "url": github_match.group(0)})
    if portfolio_match and portfolio_match.group(0) not in [l.get("url") for l in links]:
        links.append({"label": "Portfolio", "url": portfolio_match.group(0)})

    return {
        "fullName": full_name or "Candidate Name",
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
        "location": location_match.group(0) if location_match else "",
        "linkedin": linkedin_match.group(0) if linkedin_match else "",
        "github": github_match.group(0) if github_match else "",
        "portfolio": portfolio_match.group(0) if portfolio_match else "",
        "links": links
    }

def detect_sections(text: str) -> Dict[str, str]:
    """Segment resume text into known sections."""
    section_patterns = {
        "summary": r'(?:summary|objective|profile|about\s+me)\b',
        "skills": r'(?:skills|technical\s+skills|core\s+competencies|technologies)\b',
        "experience": r'(?:experience|work\s+experience|employment|work\s+history)\b',
        "education": r'(?:education|academic\s+background|qualifications)\b',
        "projects": r'(?:projects|personal\s+projects|academic\s+projects)\b',
        "certifications": r'(?:certifications|certificates|licenses)\b',
        "achievements": r'(?:achievements|awards|honors)\b',
        "languages": r'(?:languages|spoken\s+languages)\b'
    }

    lines = text.split('\n')
    current_section = "header"
    sections: Dict[str, List[str]] = {
        "header": [], "summary": [], "skills": [], "experience": [],
        "education": [], "projects": [], "certifications": [],
        "achievements": [], "languages": []
    }

    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue
        
        # Check if line acts as a header (short length, uppercase or title case)
        matched_sec = None
        if len(cleaned.split()) <= 4:
            for sec_name, pattern in section_patterns.items():
                if re.search(pattern, cleaned, re.I):
                    matched_sec = sec_name
                    break
        
        if matched_sec:
            current_section = matched_sec
        else:
            sections[current_section].append(cleaned)

    return {k: "\n".join(v) for k, v in sections.items()}

def parse_skills_section(skills_text: str, full_text: str) -> List[Dict[str, str]]:
    combined = (skills_text + " " + full_text).lower()
    found_skills = []
    seen = set()

    for skill in COMMON_TECH_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, combined):
            # Categorize
            category = "Technical"
            if skill in ["python", "java", "javascript", "typescript", "c++", "c#", "go", "ruby", "rust", "php", "sql"]:
                category = "Programming"
            elif skill in ["react", "vue", "angular", "node.js", "express", "django", "flask", "fastapi", "spring boot", "next.js"]:
                category = "Frameworks"
            elif skill in ["mongodb", "postgresql", "mysql", "redis", "elasticsearch", "sqlite"]:
                category = "Databases"
            elif skill in ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform", "linux"]:
                category = "Cloud & DevOps"
            elif skill in ["git", "rest api", "graphql", "microservices", "jira", "agile"]:
                category = "Tools & Architecture"

            disp_name = skill.title() if len(skill) > 3 and skill not in ["aws", "gcp", "sql", "api", "css", "html"] else skill.upper()
            if disp_name.lower() not in seen:
                seen.add(disp_name.lower())
                found_skills.append({
                    "name": disp_name,
                    "category": category,
                    "level": "Intermediate"
                })

    return found_skills

def parse_experience_section(exp_text: str) -> List[Dict[str, Any]]:
    if not exp_text.strip():
        return []

    entries = []
    lines = [l.strip() for l in exp_text.split('\n') if l.strip()]
    current_entry = None

    for line in lines:
        is_bullet = line.startswith(('•', '-', '*', '–'))
        # Check for company / role pattern
        if not is_bullet and (len(line.split()) <= 6 or '–' in line or '-' in line or '|' in line):
            if current_entry:
                entries.append(current_entry)
            parts = re.split(r'[|–-]', line)
            pos = parts[0].strip() if len(parts) > 0 else "Software Engineer"
            comp = parts[1].strip() if len(parts) > 1 else "Tech Company"
            current_entry = {
                "position": pos,
                "company": comp,
                "location": "",
                "startDate": "",
                "endDate": "Present",
                "current": True,
                "highlights": []
            }
        else:
            cleaned_bullet = re.sub(r'^[•\-\*\–\s]+', '', line)
            if current_entry:
                current_entry["highlights"].append(cleaned_bullet)
            else:
                current_entry = {
                    "position": "Software Engineer",
                    "company": "Company",
                    "location": "",
                    "startDate": "",
                    "endDate": "Present",
                    "current": True,
                    "highlights": [cleaned_bullet]
                }

    if current_entry:
        entries.append(current_entry)

    return entries

def parse_projects_section(proj_text: str) -> List[Dict[str, Any]]:
    if not proj_text.strip():
        return []

    projects = []
    lines = [l.strip() for l in proj_text.split('\n') if l.strip()]
    current_proj = None

    for line in lines:
        is_bullet = line.startswith(('•', '-', '*', '–'))
        if not is_bullet and len(line.split()) <= 7:
            if current_proj:
                projects.append(current_proj)
            current_proj = {
                "title": line,
                "description": "",
                "technologies": [],
                "link": "",
                "highlights": []
            }
        else:
            cleaned = re.sub(r'^[•\-\*\–\s]+', '', line)
            if current_proj:
                current_proj["highlights"].append(cleaned)
                if not current_proj["description"]:
                    current_proj["description"] = cleaned
            else:
                current_proj = {
                    "title": "Technical Project",
                    "description": cleaned,
                    "technologies": [],
                    "link": "",
                    "highlights": [cleaned]
                }

    if current_proj:
        projects.append(current_proj)

    return projects

def parse_education_section(edu_text: str) -> List[Dict[str, Any]]:
    if not edu_text.strip():
        return []

    entries = []
    lines = [l.strip() for l in edu_text.split('\n') if l.strip()]
    
    # Simple parse
    degree = "Bachelor of Science in Computer Science"
    institution = "University"
    grad_date = ""

    for line in lines:
        if re.search(r'(bachelor|master|b\.s|b\.tech|m\.s|m\.tech|phd|associate|degree)', line, re.I):
            degree = line
        elif re.search(r'(university|college|institute|school|academy)', line, re.I):
            institution = line
        elif re.search(r'\b(20\d\d|19\d\d)\b', line):
            grad_date = line

    entries.append({
        "degree": degree,
        "institution": institution,
        "location": "",
        "graduationDate": grad_date,
        "gpa": "",
        "highlights": []
    })

    return entries

def parse_resume_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    lower_name = filename.lower()
    if lower_name.endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_bytes)
    elif lower_name.endswith('.docx'):
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raw_text = extract_text_from_txt(file_bytes)

    sections = detect_sections(raw_text)
    contact = extract_contact_info(sections.get("header", "") + "\n" + raw_text[:300])
    skills = parse_skills_section(sections.get("skills", ""), raw_text)
    experience = parse_experience_section(sections.get("experience", ""))
    projects = parse_projects_section(sections.get("projects", ""))
    education = parse_education_section(sections.get("education", ""))

    summary = sections.get("summary", "").strip()
    if not summary and len(sections.get("header", "").split('\n')) > 3:
        summary = "\n".join(sections.get("header", "").split('\n')[2:])

    return {
        "rawText": raw_text,
        "structured": {
            "title": f"{contact['fullName']} Resume",
            "templateId": "ats-classic",
            "personalInfo": contact,
            "links": contact.get("links", []),
            "summary": summary,
            "education": education,
            "skills": skills,
            "experience": experience,
            "projects": projects,
            "certifications": [c.strip() for c in sections.get("certifications", "").split('\n') if c.strip()],
            "achievements": [a.strip() for a in sections.get("achievements", "").split('\n') if a.strip()],
            "languages": [l.strip() for l in sections.get("languages", "").split('\n') if l.strip()]
        }
    }
