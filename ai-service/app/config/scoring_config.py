"""
Scoring Configuration for AI ATS Resume Optimizer.
Defines transparent weights, category limits, calibration bands, and linguistic dictionaries.
"""

from typing import Dict, Any, List

# 8 Core Dimension Weights (Must sum to 100)
RUBRIC_WEIGHTS: Dict[str, int] = {
    "machineReadability": 15,         # Character encoding, extractability, text flow, standard symbols
    "resumeStructure": 15,            # Logical hierarchy, linear flow, career-stage section presence
    "sectionCompleteness": 15,        # Depth, specificity, and substance within sections (not mere existence)
    "contentQuality": 15,             # Action verbs, quantifiable metrics, specificity, impact orientation
    "skillsKeywordQuality": 15,       # Contextual proof in experience/projects, anti-keyword-stuffing
    "experienceProjectQuality": 10,   # Technical depth, deliverables, complexity, fresher project credit
    "formattingAtsSafety": 10,        # Single-stream layout, absence of tables/columns/graphic hazards
    "professionalLanguage": 5         # Tone, third-person perspective, absence of first-person pronouns
}

# Calibration Bands
CALIBRATION_BANDS: Dict[str, Dict[str, Any]] = {
    "VERY_WEAK": {"min": 20, "max": 39, "label": "Critical Rework Required"},
    "WEAK": {"min": 40, "max": 54, "label": "Below Industry Standards"},
    "AVERAGE": {"min": 55, "max": 69, "label": "Moderate ATS Compatibility"},
    "GOOD": {"min": 70, "max": 84, "label": "Strong ATS Compatibility"},
    "STRONG": {"min": 85, "max": 94, "label": "High Competitive Alignment"},
    "EXCELLENT": {"min": 95, "max": 100, "label": "Exceptional ATS Optimization"}
}

# Strong Action Verbs for High-Impact Bullet Points
POWER_ACTION_VERBS: List[str] = [
    "accelerated", "accomplished", "achieved", "acquired", "administered", "advanced",
    "analyzed", "architected", "automated", "boosted", "built", "centralized",
    "championed", "coached", "collaborated", "constructed", "coordinated", "created",
    "decreased", "delivered", "deployed", "designed", "developed", "devised",
    "diminished", "directed", "doubled", "drafted", "eliminated", "enabled",
    "enacted", "engineered", "enhanced", "established", "evaluated", "exceeded",
    "executed", "expanded", "expedited", "fabricated", "facilitated", "formulated",
    "generated", "guided", "implemented", "improved", "increased", "initiated",
    "innovated", "inspected", "installed", "instituted", "integrated", "invented",
    "launched", "led", "leveraged", "maintained", "managed", "maximized",
    "mentored", "migrated", "minimized", "modernized", "monitored", "negotiated",
    "optimized", "orchestrated", "overhauled", "oversaw", "pioneered", "planned",
    "produced", "programmed", "published", "rearchitected", "rebuilt", "redesigned",
    "reduced", "refactored", "refined", "remodeled", "reorganized", "resolved",
    "restructured", "revamped", "scaled", "scheduled", "secured", "simplified",
    "spearheaded", "standardized", "streamlined", "strengthened", "surpassed", "trained",
    "transformed", "tripled", "troubleshot", "unified", "upgraded", "validated"
]

# Weak, Passive, or Responsibility-Only Phrases (Penalized)
WEAK_PASSIVE_PHRASES: List[str] = [
    "responsible for", "duties included", "handled", "helped with", "helped",
    "assisted with", "assisted", "worked on", "participated in", "tried to",
    "attempted to", "tasked with", "was involved in", "part of team that",
    "contributed to", "served as", "familiar with", "knowledge of", "exposure to",
    "learning", "various tasks", "did various", "etc.", "stuff", "things"
]

# First-person singular pronouns strictly discouraged in professional resumes
FIRST_PERSON_PRONOUNS: List[str] = [
    r"\bi\b", r"\bme\b", r"\bmy\b", r"\bmyself\b", r"\bmine\b"
]

# Formatting Hazard Clues
FORMATTING_HAZARDS: Dict[str, str] = {
    "tables": r"(\|[\s\w\-]+){2,}\||\b(cell|rowspan|colspan)\b",
    "columns": r"(?:\s{6,}[A-Z][a-z]+){2,}",
    "decorative_bullets": r"[►▶◆❖★☆■□▲▼♦✓✔●]",
    "unusual_symbols": r"[^\x00-\x7F\u2022\u2013\u2014\u2018\u2019\u201C\u201D]"
}
