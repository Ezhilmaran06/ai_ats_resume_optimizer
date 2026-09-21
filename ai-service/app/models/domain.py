from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ParsedResumeResult(BaseModel):
    filename: str
    rawText: str
    personalInfo: Dict[str, Any] = Field(default_factory=dict)
    summary: str = ""
    skills: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[Dict[str, Any]] = Field(default_factory=list)
    achievements: List[Dict[str, Any]] = Field(default_factory=list)
    links: List[Dict[str, str]] = Field(default_factory=list)
    extractedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
