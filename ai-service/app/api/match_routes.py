from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.semantic_matcher import perform_resume_role_matching

router = APIRouter(prefix="/api/ai/match", tags=["Match"])

@router.post("/analyze")
async def analyze_match(payload: Dict[str, Any]):
    resume = payload.get("resume")
    role_data = payload.get("role") or payload.get("job") or payload.get("jobRequirements") or {}

    if not resume:
        raise HTTPException(status_code=400, detail="Missing candidate resume data.")

    # If role_data is empty but role or description passed at root
    if not role_data and (payload.get("description") or payload.get("rawText")):
        role_data = {
            "role": payload.get("role", "Software Engineer"),
            "description": payload.get("description") or payload.get("rawText"),
            "company": payload.get("company", "")
        }

    match_result = perform_resume_role_matching(resume, role_data)

    matched_list = match_result.get("matchedSkills", [])
    partial_list = match_result.get("partialSkills", [])
    missing_list = match_result.get("missingSkills", [])
    score = match_result.get("matchPercentage", 0)

    recommendations = []
    for p in partial_list[:3]:
        recommendations.append(f"Strengthen evidence for '{p.get('name')}' by describing specific project outcomes.")
    for m in missing_list[:3]:
        recommendations.append(f"Target role requires '{m.get('name')}'. If you possess this experience, consider highlighting relevant projects.")

    match_contract = {
        "score": score,
        "matched": matched_list,
        "partial": partial_list,
        "missing": missing_list,
        "recommendations": recommendations
    }

    return {
        "success": True,
        "match": match_contract,
        "data": match_result
    }
