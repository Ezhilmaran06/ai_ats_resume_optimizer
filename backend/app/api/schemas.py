"""
Pydantic API schemas for request and response validation.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "sign-language-recognition"
    model_loaded: bool

class ModelStatusResponse(BaseModel):
    model_loaded: bool
    model_name: str
    model_version: str
    supported_labels: List[str]
    num_classes: int
    expected_feature_dim: int
    confidence_threshold: float
    stability_frames_required: int
    model_path: str
    label_map_path: str

class RecognizeRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded JPEG/PNG frame from webcam")
    confidence_threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Optional override for confidence threshold")

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float

class RecognizeResponse(BaseModel):
    success: bool
    hand_detected: bool
    prediction: Optional[str] = None
    raw_prediction: Optional[str] = None
    confidence: float = 0.0
    is_confident: bool = False
    stable_prediction: bool = False
    stable_label: Optional[str] = None
    probabilities: Dict[str, float] = {}
    landmarks: List[LandmarkPoint] = []
    message: str

class VocabularyItem(BaseModel):
    label: str
    display_name: str
    description: str
    supported: bool

class VocabularyResponse(BaseModel):
    vocabulary: List[VocabularyItem]
    total_signs: int
    model_loaded: bool

