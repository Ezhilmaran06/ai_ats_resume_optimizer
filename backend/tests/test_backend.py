"""
SignSpeak AI - Backend and Model Unit / Integration Tests.
"""
import base64
import json
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.inference.model_loader import gesture_model, GestureModel
from app.inference.predictor import PredictionSmoother, GesturePredictor
from app.vision.landmark_utils import normalize_landmarks, extract_raw_landmarks_array, TOTAL_FEATURES
from app.vision.preprocessing import decode_base64_image

client = TestClient(app)

def test_health_endpoint():
    """Verify health endpoint returns ok and reports model loaded."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "sign-language-recognition"
    assert isinstance(data["model_loaded"], bool)

def test_model_status_endpoint():
    """Verify model status endpoint returns expected schema."""
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_loaded" in data
    assert "supported_labels" in data
    assert "confidence_threshold" in data
    assert data["expected_feature_dim"] == 63

def test_vocabulary_endpoint():
    """Verify supported vocabulary lists all trained labels."""
    response = client.get("/api/vocabulary")
    assert response.status_code == 200
    data = response.json()
    assert "vocabulary" in data
    assert isinstance(data["vocabulary"], list)
    if data["model_loaded"]:
        assert len(data["vocabulary"]) > 0

def test_blank_image_no_hand_detected():
    """Verify that a blank black frame returns hand_detected: false without crashing."""
    # Create a 200x200 black image
    blank_img = np.zeros((200, 200, 3), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", blank_img)
    b64_str = base64.b64encode(buffer).decode("utf-8")

    response = client.post("/api/recognize", json={"image": b64_str})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["hand_detected"] is False
    assert data["prediction"] is None
    assert data["confidence"] == 0.0

def test_invalid_image_base64():
    """Verify corrupt base64 string is rejected gracefully."""
    response = client.post("/api/recognize", json={"image": "not-a-valid-base64-image!!!"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["hand_detected"] is False
    assert "Invalid or unreadable" in data["message"]

def test_prediction_smoother():
    """Verify that smoothing requires consecutive frames before triggering stable prediction."""
    smoother = PredictionSmoother(window_size=3)
    
    # 1 frame
    stable, lbl = smoother.add_prediction("HELLO", 0.9, 0.75)
    assert not stable
    
    # 2 frames
    stable, lbl = smoother.add_prediction("HELLO", 0.9, 0.75)
    assert not stable

    # 3 frames -> now stable!
    stable, lbl = smoother.add_prediction("HELLO", 0.9, 0.75)
    assert stable
    assert lbl == "HELLO"

    # Low confidence frame resets stability
    stable, lbl = smoother.add_prediction("HELLO", 0.4, 0.75)
    assert not stable

def test_landmark_normalization_invariance():
    """Verify translation and scale normalization gives identical features."""
    # Create base coordinates
    coords1 = np.random.uniform(0.2, 0.8, size=(21, 3)).astype(np.float32)
    features1 = normalize_landmarks(coords1)
    assert len(features1) == 63

    # Translate coordinates by adding constant offset
    coords2 = coords1 + np.array([5.0, -10.0, 3.0], dtype=np.float32)
    features2 = normalize_landmarks(coords2)

    # Scale coordinates by multiplying
    coords3 = coords1 * 2.5
    features3 = normalize_landmarks(coords3)

    # Invariant: features must be virtually identical
    np.testing.assert_allclose(features1, features2, atol=1e-5)
    np.testing.assert_allclose(features1, features3, atol=1e-5)

def test_missing_model_behavior(tmp_path):
    """Verify that if model file is missing, backend handles it without throwing an unhandled exception."""
    missing_model = GestureModel(
        model_path=tmp_path / "non_existent.pkl",
        label_map_path=tmp_path / "non_existent.json"
    )
    loaded = missing_model.load()
    assert not loaded
    assert not missing_model.is_loaded
    summary = missing_model.get_status_summary()
    assert summary["model_loaded"] is False
