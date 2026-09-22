"""
Deep NLP Analyzer for AI ATS Resume Optimizer.
Extracts rigorous deterministic NLP signals:
- Quantifiable metrics and outcome detection
- Action verb starting power vs passive phrasing
- Skill contextual verification (anti-keyword stuffing)
- Career stage detection (student/fresher anti-penalty)
- Professional language tone and first-person pronoun audit
- Machine readability and structural hazard detection
"""

import re
from typing import Dict, Any, List, Set, Tuple
from app.config.scoring_config import (
    POWER_ACTION_VERBS,
    WEAK_PASSIVE_PHRASES,
    FIRST_PERSON_PRONOUNS,
    FORMATTING_HAZARDS
)

METRIC_PATTERNS = [
    r'\b\d+(?:\.\d+)?%\b',                          # Percentages: 25%, 3.5%
    r'\$\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*[kKmMbB])?\b',# Currency: $50k, $1.2M
    r'\b\d+\s*(?:k|K|M|B|million|billion|thousand)\b',# Scale: 500k, 10M
    r'\b\d+\s*(?:x|X)\s*(?:faster|reduction|increase|growth)?\b',# Multipliers: 3x, 2X faster
    r'\b(?:reduced|increased|improved|decreased|saved|generated|boosted)\s+by\s+\d+',# Impact by number
    r'\b(?:team\s+of|managed|mentored)\s+\d+',       # Team count: team of 6
    r'\b\d+\s*(?:users|clients|customers|requests|transactions|queries|endpoints|services|nodes|servers)\b',# Technical scale
    r'\b\d+\s*(?:ms|seconds|minutes|hours|days|weeks)\b' # Latency/time: 50ms, 2 hours
]

def detect_metrics(text: str) -> List[str]:
    """Extract all quantifiable metrics and figures from text."""
    if not text:
        return []
    found = []
    for pat in METRIC_PATTERNS:
        matches = re.findall(pat, text, re.IGNORECASE)
        for m in matches:
            found.append(m.strip())
    return list(dict.fromkeys(found))

def detect_action_verbs_and_weaknesses(bullets: List[str]) -> Dict[str, Any]:
    """Analyze bullet points for strong action verbs vs weak/passive phrases."""
    total_bullets = len(bullets)
    if total_bullets == 0:
        return {
            "totalBullets": 0,
            "strongCount": 0,
            "weakCount": 0,
            "strongRatio": 0.0,
            "weakPhrasesFound": [],
            "actionVerbsFound": []
        }

    strong_count = 0
    weak_count = 0
    action_verbs_found = []
    weak_phrases_found = []

    for bullet in bullets:
        clean = bullet.strip().lower()
        if not clean:
            continue

        # Check for weak passive phrases
        for wp in WEAK_PASSIVE_PHRASES:
            if wp in clean:
                weak_count += 1
                weak_phrases_found.append(wp)
                break

        # Check if bullet begins with a power action verb (or within first 3 words)
        words = re.findall(r'[a-zA-Z]+', clean)
        first_words = words[:3] if len(words) >= 3 else words
        has_strong_verb = False
        for w in first_words:
            if w in POWER_ACTION_VERBS:
                has_strong_verb = True
                action_verbs_found.append(w)
                break
        if has_strong_verb:
            strong_count += 1

    return {
        "totalBullets": total_bullets,
        "strongCount": strong_count,
        "weakCount": weak_count,
        "strongRatio": round(strong_count / max(1, total_bullets), 2),
        "weakPhrasesFound": list(dict.fromkeys(weak_phrases_found)),
        "actionVerbsFound": list(dict.fromkeys(action_verbs_found))
    }

def detect_career_stage(resume: Dict[str, Any]) -> str:
    """
    Detect whether candidate is a Student/Fresher, Early Career, or Experienced.
    Used for Anti-Penalty fairness so students are not crushed for lack of 5-year work history.
    """
    text_sample = str(resume).lower()
    
    # Check for student/fresher markers
    student_markers = [
        "student", "fresher", "intern", "internship", "graduate", "undergraduate",
        "bachelor of", "b.tech", "b.s.", "expected graduation", "class of 202"
    ]
    if any(m in text_sample for m in student_markers):
        exp = resume.get("experience") or []
        # If 0 or 1 experience entries, classify as FRESHER
        if len(exp) <= 1:
            return "FRESHER"

    exp_years = len(resume.get("experience") or [])
    if exp_years >= 4:
        return "SENIOR"
    elif exp_years >= 2:
        return "MID_LEVEL"
    else:
        return "EARLY_CAREER"

def analyze_skill_contextual_verification(resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    Anti-Keyword Stuffing Engine:
    Verifies what percentage of listed skills are actually used/demonstrated in
    experience bullet points or project descriptions.
    """
    # 1. Gather all declared skills
    skills_declared: List[str] = []
    raw_skills = resume.get("skills")
    if isinstance(raw_skills, list):
        for s in raw_skills:
            name = s.get("name") if isinstance(s, dict) else str(s)
            if name: skills_declared.append(name.strip())
    elif isinstance(raw_skills, dict):
        for val in raw_skills.values():
            if isinstance(val, list):
                for s in val:
                    name = s.get("name") if isinstance(s, dict) else str(s)
                    if name: skills_declared.append(name.strip())

    skills_declared = list(dict.fromkeys(skills_declared))
    if not skills_declared:
        return {
            "totalDeclared": 0,
            "verifiedInContext": 0,
            "unverifiedSkills": [],
            "contextualRatio": 0.0,
            "isKeywordStuffed": False
        }

    # 2. Gather body text of experience and projects
    body_parts = []
    for exp in resume.get("experience") or []:
        if isinstance(exp, dict):
            body_parts.append(exp.get("description", ""))
            body_parts.extend(exp.get("highlights", []))
            body_parts.extend(exp.get("achievements", []))
            body_parts.extend(exp.get("technologies", []))

    for proj in resume.get("projects") or []:
        if isinstance(proj, dict):
            body_parts.append(proj.get("description", ""))
            body_parts.extend(proj.get("highlights", []))
            body_parts.extend(proj.get("achievements", []))
            body_parts.extend(proj.get("technologies", []))

    body_text = " ".join(body_parts).lower()

    verified = []
    unverified = []

    for skill in skills_declared:
        s_clean = skill.lower().strip()
        if len(s_clean) < 2:
            continue
        pat = r'(?<![a-zA-Z0-9])' + re.escape(s_clean) + r'(?![a-zA-Z0-9])'
        if re.search(pat, body_text):
            verified.append(skill)
        else:
            unverified.append(skill)

    ratio = round(len(verified) / max(1, len(skills_declared)), 2)
    # Severe keyword stuffing: > 15 skills listed but less than 25% mentioned in context
    is_stuffed = (len(skills_declared) >= 15 and ratio < 0.25)

    return {
        "totalDeclared": len(skills_declared),
        "verifiedInContext": len(verified),
        "verifiedSkills": verified,
        "unverifiedSkills": unverified,
        "contextualRatio": ratio,
        "isKeywordStuffed": is_stuffed
    }

def audit_professional_language(resume: Dict[str, Any]) -> Dict[str, Any]:
    """Audit first-person pronouns, generic clichés, and professional tone."""
    all_text = []
    if resume.get("summary"):
        all_text.append(str(resume.get("summary")))

    for exp in resume.get("experience") or []:
        if isinstance(exp, dict):
            all_text.append(exp.get("description", ""))
            all_text.extend(exp.get("highlights", []))
            all_text.extend(exp.get("achievements", []))

    for proj in resume.get("projects") or []:
        if isinstance(proj, dict):
            all_text.append(proj.get("description", ""))
            all_text.extend(proj.get("highlights", []))

    full_body = " ".join(all_text)
    lower_body = full_body.lower()

    first_person_hits = []
    for pat in FIRST_PERSON_PRONOUNS:
        matches = re.findall(pat, lower_body)
        if matches:
            first_person_hits.extend(matches)

    return {
        "firstPersonCount": len(first_person_hits),
        "firstPersonPronouns": list(dict.fromkeys(first_person_hits)),
        "wordCount": len(full_body.split()),
        "hasExecutiveSummary": bool(resume.get("summary") and len(str(resume.get("summary")).split()) >= 20)
    }

def extract_all_resume_bullets(resume: Dict[str, Any]) -> List[str]:
    """Collect all experience and project bullet points into a flat list."""
    bullets = []
    for exp in resume.get("experience") or []:
        if isinstance(exp, dict):
            for h in exp.get("highlights", []) + exp.get("achievements", []):
                if h and str(h).strip():
                    bullets.append(str(h).strip())
            if exp.get("description") and not (exp.get("highlights") or exp.get("achievements")):
                bullets.append(str(exp.get("description")).strip())

    for proj in resume.get("projects") or []:
        if isinstance(proj, dict):
            for h in proj.get("highlights", []) + proj.get("achievements", []):
                if h and str(h).strip():
                    bullets.append(str(h).strip())
            if proj.get("description") and not (proj.get("highlights") or proj.get("achievements")):
                bullets.append(str(proj.get("description")).strip())

    return bullets
