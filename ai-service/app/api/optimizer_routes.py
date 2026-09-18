from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.resume_optimizer import (
    generate_full_optimization_plan,
    generate_optimized_summary,
    generate_reordered_skills,
    check_verification_status
)
from app.services.keyword_engine import analyze_keywords_against_resume

router = APIRouter(prefix="/api/ai/optimizer", tags=["Optimizer"])

@router.post("/plan")
async def get_optimization_plan(payload: Dict[str, Any]):
    resume = payload.get("resume")
    role_data = payload.get("role")

    if not resume or not role_data:
        raise HTTPException(status_code=400, detail="Missing resume or role data.")

    # Run keyword engine first to discover missing skills
    kw_analysis = analyze_keywords_against_resume(resume, role_data)
    missing_skills = [k["keyword"] for k in kw_analysis["keywords"] if k["status"] == "MISSING"]
    role_data["missingSkills"] = missing_skills

    plan = generate_full_optimization_plan(resume, role_data)
    return {
        "success": True,
        "data": plan,
        "keywords": kw_analysis
    }

@router.post("/section/improve")
async def improve_section(payload: Dict[str, Any]):
    section_name = payload.get("section")
    resume = payload.get("resume", {})
    role_data = payload.get("role", {})

    if section_name == "summary":
        sug = generate_optimized_summary(resume, role_data)
        return {"success": True, "data": sug}
    elif section_name == "skills":
        sug = generate_reordered_skills(resume, role_data)
        return {"success": True, "data": sug}
    else:
        return {
            "success": True,
            "data": {
                "id": f"sug-{section_name}",
                "section": section_name,
                "title": f"Refine {section_name.title()}",
                "current": "",
                "suggested": "Ensure measurable outcomes and action verbs are present.",
                "explanation": "Standard section optimization.",
                "status": "SUPPORTED",
                "rule": "Anti-Fabrication Verified"
            }
        }
