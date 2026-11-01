"""
MediaPipe Hand Detector wrapper supporting both MediaPipe Tasks Vision (1.0+)
and legacy solutions.hands APIs.
"""
import logging
import urllib.request
from pathlib import Path
from typing import Optional, Any
import cv2
import numpy as np

import mediapipe as mp
from ..config import settings

logger = logging.getLogger("signspeak.hand_detector")

TASK_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"

class HandDetector:
    def __init__(
        self,
        task_model_path: Optional[Path] = None,
        max_num_hands: int = settings.MAX_NUM_HANDS,
        min_detection_confidence: float = settings.MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence: float = settings.MIN_TRACKING_CONFIDENCE
    ):
        self.max_num_hands = max_num_hands
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        self.detector = None
        self.legacy_hands = None
        
        # Check if legacy mp.solutions exists
        if hasattr(mp, "solutions") and hasattr(mp.solutions, "hands"):
            logger.info("Using MediaPipe solutions.hands API.")
            self.legacy_hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=max_num_hands,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=min_tracking_confidence
            )
        else:
            # Use MediaPipe Tasks Vision API
            task_path = Path(task_model_path if task_model_path else settings.TASK_MODEL_PATH)
            if not task_path.exists():
                logger.info(f"Task model not found at {task_path}. Downloading from Google storage...")
                task_path.parent.mkdir(parents=True, exist_ok=True)
                urllib.request.urlretrieve(TASK_MODEL_URL, task_path)
                logger.info(f"Successfully downloaded hand_landmarker.task to {task_path}")

            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            base_options = python.BaseOptions(model_asset_path=str(task_path))
            options = vision.HandLandmarkerOptions(
                base_options=base_options,
                num_hands=max_num_hands,
                min_hand_detection_confidence=min_detection_confidence,
                min_hand_presence_confidence=min_tracking_confidence
            )
            self.detector = vision.HandLandmarker.create_from_options(options)
            logger.info(f"Initialized MediaPipe Tasks HandLandmarker from {task_path}")

    def find_hand_landmarks(self, frame_bgr: np.ndarray) -> Optional[Any]:
        """
        Process a BGR frame with MediaPipe Hands.
        Returns the landmarks of the primary detected hand (21 landmarks), or None.
        """
        if frame_bgr is None or frame_bgr.size == 0:
            return None

        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

        if self.legacy_hands is not None:
            results = self.legacy_hands.process(rgb_frame)
            if results.multi_hand_landmarks and len(results.multi_hand_landmarks) > 0:
                return results.multi_hand_landmarks[0]
            return None

        if self.detector is not None:
            # MediaPipe Tasks expects mp.Image with SRGB format
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            results = self.detector.detect(mp_image)
            if results.hand_landmarks and len(results.hand_landmarks) > 0:
                return results.hand_landmarks[0]
            return None

        return None

    def close(self):
        """Release vision resources."""
        if self.legacy_hands is not None:
            try:
                self.legacy_hands.close()
            except Exception:
                pass
        if self.detector is not None:
            try:
                self.detector.close()
            except Exception:
                pass
