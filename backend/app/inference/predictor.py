"""
Prediction engine with temporal smoothing and confidence filtering.
"""
from collections import deque, Counter
from typing import Optional, Dict, Any, Tuple
import numpy as np

from ..config import settings
from .model_loader import gesture_model

class PredictionSmoother:
    """
    Maintains a rolling buffer of consecutive predictions to filter out transient
    noise and only emit a stable prediction when sustained across multiple frames.
    """
    def __init__(self, window_size: int = settings.PREDICTION_STABILITY_FRAMES):
        self.window_size = window_size
        self.history = deque(maxlen=window_size)
        self.last_stable_label: Optional[str] = None

    def add_prediction(self, label: Optional[str], confidence: float, min_confidence: float) -> Tuple[bool, Optional[str]]:
        """
        Adds a new frame prediction to the history buffer.
        Returns:
            (is_stable, stable_label)
        """
        # If below threshold or no label, record None
        if label is None or confidence < min_confidence:
            self.history.append(None)
            return False, None

        self.history.append(label)

        # Buffer must be full to establish stability
        if len(self.history) < self.window_size:
            return False, None

        # Check if all items in window match the same label
        counter = Counter(self.history)
        most_common_label, count = counter.most_common(1)[0]

        if most_common_label is not None and count >= self.window_size:
            self.last_stable_label = most_common_label
            return True, most_common_label

        return False, None

    def reset(self):
        self.history.clear()
        self.last_stable_label = None

class GesturePredictor:
    """
    Coordinates model inference, confidence filtering, and temporal smoothing.
    """
    def __init__(self):
        self.smoother = PredictionSmoother(window_size=settings.PREDICTION_STABILITY_FRAMES)

    def predict_features(
        self,
        features: np.ndarray,
        min_confidence: float = settings.MIN_CONFIDENCE_THRESHOLD
    ) -> Dict[str, Any]:
        """
        Runs model inference on features, evaluates confidence, and applies smoothing.
        """
        if not gesture_model.is_loaded:
            return {
                "success": False,
                "model_loaded": False,
                "prediction": None,
                "confidence": 0.0,
                "stable_prediction": False,
                "stable_label": None,
                "message": "Model not loaded. Please train the model and export it to backend/models/."
            }

        raw_label, confidence, all_probs = gesture_model.predict(features)

        is_confident = confidence >= min_confidence
        filtered_label = raw_label if is_confident else None

        is_stable, stable_label = self.smoother.add_prediction(
            label=filtered_label,
            confidence=confidence,
            min_confidence=min_confidence
        )

        return {
            "success": True,
            "model_loaded": True,
            "prediction": filtered_label,
            "raw_prediction": raw_label,
            "confidence": round(confidence, 4),
            "is_confident": is_confident,
            "stable_prediction": is_stable,
            "stable_label": stable_label,
            "probabilities": {k: round(v, 4) for k, v in all_probs.items()},
            "message": f"Recognized '{raw_label}' with {confidence*100:.1f}% confidence" if is_confident else f"Low confidence ({confidence*100:.1f}%), sign unknown"
        }

    def reset_smoother(self):
        self.smoother.reset()

# Global predictor instance
predictor = GesturePredictor()

