from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
from app.services.resume_parser import parse_resume_document
from app.services.ats_engine import calculate_ats_score

from fastapi.responses import JSONResponse
from app.utils.normalizer import normalize_parsed_resume

router = APIRouter(prefix="/api/ai/resume", tags=["Resume"])

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename or "resume.pdf"
        parsed = parse_resume_document(content, filename)
        
        # Immediately compute baseline ATS score (Mode 1: General)
        baseline_ats = calculate_ats_score(parsed["structured"])
        
        ats_contract = {
            "score": baseline_ats.get("score", 0),
            "overallScore": baseline_ats.get("overallScore", 0),
            "categories": baseline_ats.get("categories", {}),
            "issues": baseline_ats.get("issues", []),
            "strengths": baseline_ats.get("strengths", [])
        }

        return {
            "success": True,
            "filename": filename,
            "rawText": parsed["rawText"],
            "resume": parsed["resume"],
            "structured": parsed["structured"],
            "ats": ats_contract,
            "baselineAts": baseline_ats
        }
    except ValueError as ve:
        msg = str(ve)
        if "NO_TEXT_EXTRACTED" in msg:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "error": {
                        "code": "NO_TEXT_EXTRACTED",
                        "message": "No readable text was found in this PDF. If this is a scanned document, please provide a text-searchable PDF, DOCX, or TXT file."
                    }
                }
            )
        raise HTTPException(status_code=400, detail=msg)
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

@router.post("/optimize")
async def optimize_resume(payload: Dict[str, Any]):
    resume_data = payload.get("resume")
    role_data = payload.get("role") or payload.get("job") or {}
    
    if not resume_data:
        raise HTTPException(status_code=400, detail="Missing candidate resume data.")

    from app.services.resume_optimizer import optimize_resume_for_role
    optimized_plan = optimize_resume_for_role(resume_data, role_data)

    changes = optimized_plan.get("suggestions", [])
    warnings = [
        f"Missing requirement '{a.get('skill')}': skill cannot be fabricated into resume without verified user background."
        for a in optimized_plan.get("missingSkillsAlerts", [])
    ]

    return {
        "success": True,
        "changes": changes,
        "optimizedResume": optimized_plan.get("optimizedResume", {}),
        "warnings": warnings,
        "data": optimized_plan
    }

