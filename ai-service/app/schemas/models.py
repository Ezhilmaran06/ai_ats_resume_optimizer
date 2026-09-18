from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PersonalInfo(BaseModel):
    fullName: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""

class EducationItem(BaseModel):
    degree: Optional[str] = ""
    institution: Optional[str] = ""
    location: Optional[str] = ""
    graduationDate: Optional[str] = ""
    gpa: Optional[str] = ""
    highlights: Optional[List[str]] = []

class SkillItem(BaseModel):
    name: str
    category: Optional[str] = "General"
    level: Optional[str] = "Intermediate"

class ExperienceItem(BaseModel):
    company: Optional[str] = ""
    position: Optional[str] = ""
    location: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    current: Optional[bool] = False
    highlights: Optional[List[str]] = []

class ProjectItem(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    technologies: Optional[List[str]] = []
    link: Optional[str] = ""
    highlights: Optional[List[str]] = []

class ResumeData(BaseModel):
    title: Optional[str] = "My Resume"
    templateId: Optional[str] = "ats-classic"
    targetRole: Optional[str] = ""
    targetCompany: Optional[str] = ""
    personalInfo: Optional[PersonalInfo] = Field(default_factory=PersonalInfo)
    summary: Optional[str] = ""
    education: Optional[List[EducationItem]] = []
    skills: Optional[List[SkillItem]] = []
    experience: Optional[List[ExperienceItem]] = []
    projects: Optional[List[ProjectItem]] = []
    certifications: Optional[List[str]] = []
    achievements: Optional[List[str]] = []
    languages: Optional[List[str]] = []

class JobRequirement(BaseModel):
    role: str
    company: Optional[str] = ""
    description: str

class AtsCategoryScore(BaseModel):
    category: str
    score: int
    maxScore: int
    feedback: str
    status: str

class AtsIssue(BaseModel):
    id: str
    type: str  # 'warning', 'danger', 'info'
    title: str
    description: str
    section: str
    suggestion: str
    fixableWithAi: bool = True

class AtsReport(BaseModel):
    overallScore: int
    mode: str  # 'general' or 'role_specific'
    targetRole: Optional[str] = None
    breakdown: Dict[str, AtsCategoryScore]
    strengths: List[str]
    issues: List[AtsIssue]
    recommendations: List[Dict[str, str]]
    timestamp: Optional[str] = None

class KeywordItem(BaseModel):
    keyword: str
    importance: str  # 'High', 'Medium', 'Low'
    status: str      # 'MATCHED', 'PARTIAL', 'MISSING'
    category: str    # 'Programming', 'Framework', 'Database', 'Cloud', 'Tool', 'Soft Skill'
    foundIn: Optional[str] = None
    similarityNote: Optional[str] = None

class KeywordAnalysisResult(BaseModel):
    matchPercentage: int
    matchedCount: int
    partialCount: int
    missingCount: int
    totalCount: int
    keywords: List[KeywordItem]

class AiSuggestion(BaseModel):
    id: str
    section: str
    title: str
    current: str
    suggested: str
    explanation: str
    status: str  # 'SUPPORTED', 'PARTIALLY_SUPPORTED', 'UNSUPPORTED'
    rule: str
