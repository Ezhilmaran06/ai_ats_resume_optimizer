"""
Inference model loader and predictor.
Loads trained MLP model and label mappings into memory once at startup.
"""
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import joblib
import numpy as np

from ..config import settings

logger = logging.getLogger("signspeak.model_loader")

class GestureModel:
    def __init__(
        self,
        model_path: Path = settings.MODEL_PATH,
        label_map_path: Path = settings.LABEL_MAP_PATH
    ):
        self.model_path = Path(model_path)
        self.label_map_path = Path(label_map_path)
        self.model = None
        self.label_map: Dict[int, str] = {}
        self.labels: List[str] = []
        self._is_loaded: bool = False
        self.model_name: str = "MediaPipe-MLP-Classifier"
        self.version: str = "1.0.0"

    def load(self) -> bool:
        """
        Loads the trained model and label map from disk.
        Returns True if both successfully loaded, False otherwise.
        """
        if not self.model_path.exists():
            logger.warning(f"Model file not found at: {self.model_path}")
            self._is_loaded = False
            return False

        if not self.label_map_path.exists():
            logger.warning(f"Label map file not found at: {self.label_map_path}")
            self._is_loaded = False
            return False

        try:
            # Load label mapping
            with open(self.label_map_path, "r", encoding="utf-8") as f:
                raw_map = json.load(f)
                # Ensure integer keys
                self.label_map = {int(k): v for k, v in raw_map.items()}
                # Sorted labels list by class index
                self.labels = [self.label_map[i] for i in sorted(self.label_map.keys())]

            # Load model
            self.model = joblib.load(self.model_path)
            self._is_loaded = True
            logger.info(f"Loaded gesture model from {self.model_path} with {len(self.labels)} classes: {self.labels}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model from {self.model_path}: {e}", exc_info=True)
            self.model = None
            self.label_map = {}
            self.labels = []
            self._is_loaded = False
            return False

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded and self.model is not None

    def predict(self, feature_vector: np.ndarray) -> Tuple[Optional[str], float, Dict[str, float]]:
        """
        Runs model inference on a normalized 63-element feature vector.
        Returns:
            (predicted_label, confidence_score, all_class_probabilities_dict)
        """
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Train and place model files in backend/models/ first.")

        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)

        if feature_vector.shape[1] != settings.EXPECTED_FEATURE_DIM:
            raise ValueError(
                f"Feature dimension mismatch: expected {settings.EXPECTED_FEATURE_DIM}, got {feature_vector.shape[1]}"
            )

        # Get probabilities
        probabilities = self.model.predict_proba(feature_vector)[0]
        max_idx = int(np.argmax(probabilities))
        confidence = float(probabilities[max_idx])
        predicted_label = self.label_map.get(max_idx, "UNKNOWN")

        all_probs = {
            self.label_map.get(idx, f"CLASS_{idx}"): float(prob)
            for idx, prob in enumerate(probabilities)
        }

        return predicted_label, confidence, all_probs

    def get_status_summary(self) -> Dict[str, Any]:
        """Returns structured metadata about current model status."""
        return {
            "model_loaded": self.is_loaded,
            "model_name": self.model_name if self.is_loaded else "None",
            "model_version": self.version,
            "supported_labels": self.labels,
            "num_classes": len(self.labels),
            "expected_feature_dim": settings.EXPECTED_FEATURE_DIM,
            "confidence_threshold": settings.MIN_CONFIDENCE_THRESHOLD,
            "stability_frames_required": settings.PREDICTION_STABILITY_FRAMES,
            "model_path": str(self.model_path),
            "label_map_path": str(self.label_map_path)
        }

# Global singleton model instance loaded in FastAPI lifespan
gesture_model = GestureModel()
