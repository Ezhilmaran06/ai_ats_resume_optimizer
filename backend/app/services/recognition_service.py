"""
End-to-end recognition service coordinating vision, landmark preprocessing, and inference.
"""
import logging
from typing import Dict, Any, Optional
import numpy as np

from ..config import settings
from ..vision.hand_detector import HandDetector
from ..vision.preprocessing import decode_base64_image, preprocess_landmarks
from ..inference.predictor import predictor
from ..inference.model_loader import gesture_model

logger = logging.getLogger("signspeak.recognition_service")

class RecognitionService:
    def __init__(self):
        self.detector = HandDetector()

    def process_frame(
        self,
        base64_image: str,
        confidence_threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Process a single image frame from the webcam:
        1. Decodes base64 string
        2. Detects hand with MediaPipe
        3. Extracts and normalizes 21 3D landmarks
        4. Classifies gesture if model is loaded
        5. Applies temporal smoothing
        """
        threshold = confidence_threshold if confidence_threshold is not None else settings.MIN_CONFIDENCE_THRESHOLD

        # 1. Decode image
        frame = decode_base64_image(base64_image)
        if frame is None:
            return {
                "success": False,
                "hand_detected": False,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "landmarks": [],
                "message": "Invalid or unreadable image frame."
            }

        # 2. Hand detection
        try:
            landmarks_mp = self.detector.find_hand_landmarks(frame)
        except Exception as e:
            logger.error(f"Error in MediaPipe hand detection: {e}", exc_info=True)
            return {
                "success": False,
                "hand_detected": False,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "landmarks": [],
                "message": "Error occurred during hand detection."
            }

        if landmarks_mp is None:
            # Reset smoother when no hand is present
            predictor.reset_smoother()
            return {
                "success": True,
                "hand_detected": False,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "landmarks": [],
                "message": "No hand detected in the frame."
            }

        # 3. Preprocess and normalize landmarks
        try:
            features, landmarks_list = preprocess_landmarks(landmarks_mp)
        except Exception as e:
            logger.error(f"Error in landmark preprocessing: {e}", exc_info=True)
            return {
                "success": False,
                "hand_detected": True,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "landmarks": [],
                "message": "Failed to extract or normalize hand landmarks."
            }

        # 4. Check model readiness
        if not gesture_model.is_loaded:
            return {
                "success": True,
                "hand_detected": True,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "landmarks": landmarks_list,
                "message": "Hand detected, but AI model is not yet loaded. Please train or load a model."
            }

        # 5. Model inference & smoothing
        try:
            pred_res = predictor.predict_features(features, min_confidence=threshold)
            return {
                "success": True,
                "hand_detected": True,
                "prediction": pred_res.get("prediction"),
                "raw_prediction": pred_res.get("raw_prediction"),
                "confidence": pred_res.get("confidence", 0.0),
                "is_confident": pred_res.get("is_confident", False),
                "stable_prediction": pred_res.get("stable_prediction", False),
                "stable_label": pred_res.get("stable_label"),
                "probabilities": pred_res.get("probabilities", {}),
                "landmarks": landmarks_list,
                "message": pred_res.get("message", "Prediction complete.")
            }
        except Exception as e:
            logger.error(f"Error during model prediction: {e}", exc_info=True)
            return {
                "success": False,
                "hand_detected": True,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "landmarks": landmarks_list,
                "message": "Prediction failed due to an internal error."
            }

    def close(self):
        self.detector.close()

recognition_service = RecognitionService()

