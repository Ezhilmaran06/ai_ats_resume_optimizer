"""
Input validation utilities for features, images, and labels.
"""
from typing import List, Tuple
import numpy as np

def validate_feature_vector(features: np.ndarray, expected_dim: int = 63) -> Tuple[bool, str]:
    """
    Validates that a feature vector matches expected dimensions and has no NaN or Inf values.
    """
    if features is None:
        return False, "Feature vector is None."
        
    if not isinstance(features, np.ndarray):
        return False, f"Expected numpy.ndarray, got {type(features)}."
        
    flat = features.flatten()
    if len(flat) != expected_dim:
        return False, f"Expected {expected_dim} features, got {len(flat)}."
        
    if np.isnan(flat).any():
        return False, "Feature vector contains NaN values."
        
    if np.isinf(flat).any():
        return False, "Feature vector contains infinite values."
        
    return True, "Valid feature vector."

def validate_labels(labels: List[str]) -> Tuple[bool, str]:
    """Validates that label list is non-empty and contains valid strings."""
    if not labels or len(labels) < 2:
        return False, "At least 2 gesture classes are required for classification."
        
    for label in labels:
        if not isinstance(label, str) or not label.strip():
            return False, "Invalid empty or non-string label found."
            
    return True, "Labels are valid."
