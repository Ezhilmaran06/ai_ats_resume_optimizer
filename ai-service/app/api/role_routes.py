from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.role_analyzer import analyze_job_description
from app.services.keyword_engine import analyze_keywords_against_resume

router = APIRouter(prefix="/api/ai/role", tags=["Role"])

@router.post("/analyze")
async def analyze_role(payload: Dict[str, Any]):
    role_title = payload.get("role", "")
    description = payload.get("description", "")
    company = payload.get("company", "")

    if not description:
        raise HTTPException(status_code=400, detail="Please provide a job description.")

    analysis = analyze_job_description(role_title, description, company)
    return {
        "success": True,
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
