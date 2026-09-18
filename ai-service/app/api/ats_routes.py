from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.ats_engine import calculate_ats_score

router = APIRouter(prefix="/api/ai/ats", tags=["ATS"])

@router.post("/analyze")
async def analyze_ats(payload: Dict[str, Any]):
    resume_data = payload.get("resume")
    if not resume_data:
        raise HTTPException(status_code=400, detail="Missing resume data.")
        
    role_data = payload.get("role")
    report = calculate_ats_score(resume_data, role_data)
    
    return {
        "success": True,
        "data": report
    }
