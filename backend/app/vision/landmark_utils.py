"""
Landmark utilities for hand keypoint extraction and normalization.
Supports both modern MediaPipe Tasks Vision and legacy MediaPipe solutions.
"""
from typing import List, Dict, Tuple, Optional, Any
import numpy as np

EXPECTED_LANDMARK_COUNT = 21
COORDINATES_PER_LANDMARK = 3
TOTAL_FEATURES = EXPECTED_LANDMARK_COUNT * COORDINATES_PER_LANDMARK  # 63

def _get_iterable_landmarks(landmarks: Any) -> List[Any]:
    """Helper to extract a list of 21 landmarks regardless of MediaPipe version."""
    if landmarks is None:
        return []
    if hasattr(landmarks, "landmark"):
        return list(landmarks.landmark)
    if isinstance(landmarks, (list, tuple)):
        return list(landmarks)
    return []

def landmarks_to_dict_list(landmarks: Any) -> List[Dict[str, float]]:
    """Convert MediaPipe landmark objects into a serializable list of dicts."""
    lm_list = _get_iterable_landmarks(landmarks)
    if not lm_list:
        return []
    return [
        {"x": float(lm.x), "y": float(lm.y), "z": float(lm.z)}
        for lm in lm_list
    ]

def extract_raw_landmarks_array(landmarks: Any) -> Optional[np.ndarray]:
    """
    Extracts (21, 3) numpy array from MediaPipe landmarks.
    Returns None if landmarks are invalid or count does not match 21.
    """
    lm_list = _get_iterable_landmarks(landmarks)
    if len(lm_list) != EXPECTED_LANDMARK_COUNT:
        return None
    
    coords = np.zeros((EXPECTED_LANDMARK_COUNT, COORDINATES_PER_LANDMARK), dtype=np.float32)
    for i, lm in enumerate(lm_list):
        coords[i] = [lm.x, lm.y, lm.z]
    
    return coords

def normalize_landmarks(coords: np.ndarray) -> np.ndarray:
    """
    Normalizes a (21, 3) coordinate array to be invariant to position and scale:
    1. Translation normalization: subtract wrist landmark (index 0) so wrist is (0,0,0).
    2. Scale normalization: divide by maximum Euclidean distance from wrist to any landmark.
    3. Flatten to 1D vector of 63 float32 features.
    
    This exact pipeline must be used in training, evaluation, and inference.
    """
    if coords is None or coords.shape != (EXPECTED_LANDMARK_COUNT, COORDINATES_PER_LANDMARK):
        raise ValueError(
            f"Expected coordinates of shape ({EXPECTED_LANDMARK_COUNT}, {COORDINATES_PER_LANDMARK}), "
            f"got {coords.shape if coords is not None else None}"
        )
    
    # 1. Translation: Wrist is landmark 0
    wrist = coords[0, :].copy()
    translated = coords - wrist
    
    # 2. Scale: Max distance from wrist to any other landmark
    distances = np.linalg.norm(translated, axis=1)
    max_dist = np.max(distances)
    
    # Avoid division by zero
    if max_dist < 1e-6:
        max_dist = 1.0
        
    normalized = translated / max_dist
    
    # 3. Flatten to 63-dim feature vector
    features = normalized.flatten().astype(np.float32)
    return features
