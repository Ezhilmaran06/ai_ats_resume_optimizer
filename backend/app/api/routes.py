"""
API route definitions.
"""
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

from .schemas import (
    HealthResponse,
    ModelStatusResponse,
    RecognizeRequest,
    RecognizeResponse,
    VocabularyResponse,
    VocabularyItem
)
from ..inference.model_loader import gesture_model
from ..services.recognition_service import recognition_service
from ..inference.predictor import predictor

router = APIRouter(prefix="/api")

# Human-readable metadata descriptions for vocabulary
VOCABULARY_DESCRIPTIONS = {
    "HELLO": "Open hand with palm facing forward, fingers upright waving gently.",
    "THANK_YOU": "Flat hand moving forward from chin/mouth outward toward the recipient.",
    "YES": "Fist nodding up and down, resembling a nodding head agreement.",
    "NO": "Index and middle fingers snapping down onto the thumb.",
    "I_LOVE_YOU": "Thumb, index, and pinky finger extended with middle and ring folded.",
    "PLEASE": "Open flat palm circular rub over the chest.",
    "HELP": "Closed fist with thumb up resting on an open flat palm.",
    "PEACE": "Index and middle fingers extended upward in a 'V' shape."
}

@router.get("/health", response_model=HealthResponse)
def get_health():
    """
    Returns service health and actual model loaded status.
    """
    return HealthResponse(
        status="ok",
        service="sign-language-recognition",
        model_loaded=gesture_model.is_loaded
    )

@router.get("/model/status", response_model=ModelStatusResponse)
def get_model_status():
    """
    Returns complete status of the gesture classification model.
    """
    summary = gesture_model.get_status_summary()
    return ModelStatusResponse(**summary)

@router.get("/vocabulary", response_model=VocabularyResponse)
def get_vocabulary():
    """
    Returns the list of supported gestures and their descriptions.
    """
    supported = gesture_model.labels if gesture_model.is_loaded else []
    
    # If model is loaded, show only the actual supported classes
    vocab_items = []
    for label in supported:
        clean_name = label.replace("_", " ").title()
        desc = VOCABULARY_DESCRIPTIONS.get(label, f"Gesture representing '{clean_name}'.")
        vocab_items.append(VocabularyItem(
            label=label,
            display_name=clean_name,
            description=desc,
            supported=True
        ))
        
    return VocabularyResponse(
        vocabulary=vocab_items,
        total_signs=len(vocab_items),
        model_loaded=gesture_model.is_loaded
    )

@router.post("/recognize", response_model=RecognizeResponse)
def recognize_gesture(payload: RecognizeRequest):
    """
    Process an incoming webcam image frame, detect hand landmarks,
    and return predicted sign language gesture.
    """
    result = recognition_service.process_frame(
        base64_image=payload.image,
        confidence_threshold=payload.confidence_threshold
    )
    return RecognizeResponse(**result)

@router.post("/recognize/reset")
def reset_smoothing():
    """
    Resets the temporal smoothing buffer.
    """
    predictor.reset_smoother()
    return {"success": True, "message": "Smoothing buffer reset."}

