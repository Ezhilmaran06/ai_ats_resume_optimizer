import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
from app.schemas.analyze_schema import AnalyzeResponse
from app.services.unified_analyzer import run_ats_analysis

router = APIRouter(tags=["ATS Analysis"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/api/analyze", response_model=AnalyzeResponse)
@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume_endpoint(
    resume: Optional[UploadFile] = File(None, description="Resume document file (PDF, DOCX, TXT)"),
    job_description: str = Form(default="", description="Target Job Description text")
):
    """
    Primary ATS Resume + Job Description Analysis Endpoint.
    Analyzes uploaded resume against job description using AI/NLP engine.
    Returns strictly validated ATS score, breakdown, keyword coverage, semantic matches,
    problems, and actionable recommendations.
    """
    # 1. Validate file presence
    if not resume or not resume.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume file provided. Please upload a PDF, DOCX, or TXT file."
        )

    # 2. Validate file extension
    ext = os.path.splitext(resume.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: PDF, DOCX, TXT."
        )

    # 3. Read file content and validate size
    try:
        content = await resume.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded resume file: {str(e)}"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded resume file is empty. Please upload a valid document."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10MB limit. Please upload a smaller resume file."
        )

    # 4. Validate Job Description
    clean_jd = (job_description or "").strip()
    if not clean_jd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty. Please paste the complete job description."
        )

    if len(clean_jd) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too brief. Please paste the complete job description including responsibilities and requirements (at least 30 characters)."
        )

    # 5. Run Unified ATS Analysis
    try:
        analysis_result = run_ats_analysis(
            resume_bytes=content,
            filename=resume.filename,
            job_description=clean_jd
        )
        return analysis_result
    except ValueError as ve:
        msg = str(ve)
        if "NO_TEXT_EXTRACTED" in msg or "readable text" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Unable to analyze this resume. Please upload a text-readable PDF, DOCX, or TXT file (scanned or image-only PDFs are not supported)."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine error: {str(e)}"
        )
