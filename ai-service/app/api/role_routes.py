from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.role_analyzer import analyze_job_description
from app.services.keyword_engine import analyze_keywords_against_resume

router = APIRouter(prefix="/api/ai/role", tags=["Role"])

@router.post("/analyze")
async def analyze_role(payload: Dict[str, Any]):
    role_title = payload.get("role") or payload.get("job_title") or payload.get("jobTitle") or payload.get("title") or ""
    description = payload.get("description") or payload.get("rawText") or payload.get("text") or payload.get("jobDescription") or ""
    company = payload.get("company") or ""

    if not description or not str(description).strip():
        raise HTTPException(status_code=400, detail="Please provide a job description.")

    analysis = analyze_job_description(str(role_title), str(description), str(company))

    technical_skills = list(dict.fromkeys(
        (analysis.get("programmingLanguages") or []) +
        (analysis.get("frameworks") or []) +
        (analysis.get("databases") or []) +
        (analysis.get("cloudTechnologies") or []) +
        (analysis.get("tools") or [])
    ))

    role_contract = {
        "title": analysis.get("jobTitle") or str(role_title),
        "requiredSkills": analysis.get("requiredSkills") or [],
        "preferredSkills": analysis.get("preferredSkills") or [],
        "technicalSkills": technical_skills,
        "softSkills": analysis.get("softSkills") or [],
        "responsibilities": analysis.get("responsibilities") or [],
        "keywords": analysis.get("keywords") or [],
        "education": analysis.get("education") or [],
        "experience": analysis.get("experience") or []
    }

    return {
        "success": True,
        "role": role_contract,
        "data": analysis
    }

@router.post("/keywords")
async def analyze_keywords(payload: Dict[str, Any]):
    resume = payload.get("resume")
    role_data = payload.get("role")

    if not resume or not role_data:
        raise HTTPException(status_code=400, detail="Missing resume or role data.")

    keyword_results = analyze_keywords_against_resume(resume, role_data)
    return {
        "success": True,
        "data": keyword_results
    }
