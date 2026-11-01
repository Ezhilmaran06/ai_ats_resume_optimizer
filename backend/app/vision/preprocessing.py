"""
Image decoding and landmark preprocessing pipeline.
"""
import base64
import re
from typing import Optional, Tuple, List, Dict
import cv2
import numpy as np

from .landmark_utils import (
    extract_raw_landmarks_array,
    normalize_landmarks,
    landmarks_to_dict_list,
    TOTAL_FEATURES
)

def decode_base64_image(base64_str: str) -> Optional[np.ndarray]:
    """
    Decodes a base64 encoded image string (with or without data URI prefix)
    into an OpenCV BGR numpy image.
    """
    if not base64_str:
        return None
    
    try:
        # Strip data URL prefix if present e.g. "data:image/jpeg;base64,"
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
            
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

def preprocess_landmarks(mediapipe_landmarks) -> Tuple[Optional[np.ndarray], List[Dict[str, float]]]:
    """
    Preprocess hand landmarks for inference:
    1. Extracts raw 21x3 coordinates
    2. Applies invariant translation and scale normalization
    3. Produces a 63-element feature vector and serializable dictionary of landmark coordinates.
    """
    if mediapipe_landmarks is None:
        return None, []
        
    dict_list = landmarks_to_dict_list(mediapipe_landmarks)
    raw_coords = extract_raw_landmarks_array(mediapipe_landmarks)
    
    if raw_coords is None:
        return None, dict_list
        
    features = normalize_landmarks(raw_coords)
    return features, dict_list
