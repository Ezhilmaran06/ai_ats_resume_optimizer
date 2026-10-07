from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ScoreBreakdown(BaseModel):
    ats_readability: int = Field(..., ge=0, le=15, description="ATS text extractability & clean formatting (Max 15)")
    structure: int = Field(..., ge=0, le=15, description="Linear section hierarchy & organization (Max 15)")
    keyword_coverage: int = Field(..., ge=0, le=20, description="Job description keyword coverage (Max 20)")
    skills_match: int = Field(..., ge=0, le=15, description="Semantic skills alignment (Max 15)")
    experience_relevance: int = Field(..., ge=0, le=10, description="Work history & domain relevance (Max 10)")
    project_relevance: int = Field(..., ge=0, le=10, description="Project depth & technical relevance (Max 10)")
    job_alignment: int = Field(..., ge=0, le=10, description="Role responsibilities & qualifications alignment (Max 10)")
    professional_language: int = Field(..., ge=0, le=5, description="Power verbs, active voice, professional tone (Max 5)")

class MissingKeywordItem(BaseModel):
    keyword: str
    importance: str  # 'HIGH', 'MEDIUM', 'LOW'
    reason: str
    risky: bool = False

class RecommendedKeywordItem(BaseModel):
    keyword: str
    importance: str
    reason: str

class SemanticMatchItem(BaseModel):
    requirement: str
    resume_match: str
    match_type: str  # 'Strong Match', 'Partial Match', 'Missing'
    explanation: str

class ProblemItem(BaseModel):
    title: str
    description: str
    severity: str = "MEDIUM"  # 'HIGH', 'MEDIUM', 'LOW'

class SuggestedRewrite(BaseModel):
    section: str = "Projects / Experience"
    current: str
    suggested: str
    label: str = "Suggested Rewrite"
    reason: Optional[str] = None

class RecommendationItem(BaseModel):
    priority: str  # 'Priority 1', 'Priority 2', etc.
    title: str
    reason: str
    suggestion: str
    suggested_rewrite: Optional[SuggestedRewrite] = None

class AnalyzeResponse(BaseModel):
    ats_score: int = Field(..., ge=0, le=100, description="AI ATS Compatibility Score (0-100)")
    score_breakdown: ScoreBreakdown
    matched_keywords: List[str]
    missing_keywords: List[MissingKeywordItem]
    recommended_keywords: List[RecommendedKeywordItem]
    semantic_matches: List[SemanticMatchItem]
    problems: List[ProblemItem]
    recommendations: List[RecommendationItem]
    resume_summary: str
    job_summary: str
    confidence: int = Field(..., ge=0, le=100)
