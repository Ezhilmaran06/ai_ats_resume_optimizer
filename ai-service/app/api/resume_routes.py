from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
from app.services.resume_parser import parse_resume_document
from app.services.ats_engine import calculate_ats_score

router = APIRouter(prefix="/api/ai/resume", tags=["Resume"])

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename or "resume.pdf"
        parsed = parse_resume_document(content, filename)
        
        # Immediately compute baseline ATS score (Mode 1: General)
        baseline_ats = calculate_ats_score(parsed["structured"])
        
        return {
            "success": True,
            "filename": filename,
            "rawText": parsed["rawText"],
            "structured": parsed["structured"],
            "baselineAts": baseline_ats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@router.post("/recalculate")
async def recalculate_score(payload: Dict[str, Any]):
    resume_data = payload.get("resume", {})
    role_data = payload.get("role")
    
    score_report = calculate_ats_score(resume_data, role_data)
    return {
        "success": True,
        "data": score_report
    }
