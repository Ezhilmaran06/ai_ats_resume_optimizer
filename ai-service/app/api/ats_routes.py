from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.ats_engine import calculate_ats_score

router = APIRouter(prefix="/api/ai/ats", tags=["ATS"])

@router.post("/analyze")
async def analyze_ats(payload: Dict[str, Any]):
    resume_data = payload.get("resume") if "resume" in payload else payload
    if not resume_data or not isinstance(resume_data, dict):
        raise HTTPException(status_code=400, detail="Missing resume data.")
        
    role_data = payload.get("role") if "resume" in payload else None
    raw_text = payload.get("rawText", "")
    force_refresh = bool(payload.get("forceRefresh") or payload.get("force_refresh") or False)

    report = calculate_ats_score(
        resume=resume_data,
        role_data=role_data,
        raw_text=raw_text,
        force_refresh=force_refresh
    )
    
    return {
        "success": True,
        "label": "ATS Compatibility Score",
        "score": report.get("score"),
        "overallScore": report.get("overallScore"),
        "displayScore": report.get("displayScore"),
        "confidenceScore": report.get("confidenceScore"),
        "disclaimer": report.get("disclaimer"),
        "data": report
    }
