# FastAPI REST API Documentation

The SignSpeak AI backend exposes RESTful endpoints for real-time inference, model configuration, and health monitoring.

**Base URL**: `http://localhost:8000` (configurable via `PORT` and `HOST`)  
**Interactive Swagger UI**: `http://localhost:8000/docs`  
**OpenAPI Spec**: `http://localhost:8000/openapi.json`

---

## Endpoints

### 1. Health Check
Checks service operational status and whether the machine learning model is loaded in memory.

- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
```json
{
  "status": "ok",
  "service": "sign-language-recognition",
  "model_loaded": true
}
```

---

### 2. Model Status
Returns metadata about the active neural classifier, supported vocabulary, and threshold configurations.

- **URL**: `/api/model/status`
- **Method**: `GET`
- **Response**:
```json
{
  "model_loaded": true,
  "model_name": "MediaPipe-MLP-Classifier",
  "model_version": "1.0.0",
  "supported_labels": ["HELLO", "HELP", "I_LOVE_YOU", "NO", "PEACE", "PLEASE", "THANK_YOU", "YES"],
  "num_classes": 8,
  "expected_feature_dim": 63,
  "confidence_threshold": 0.75,
  "stability_frames_required": 4,
  "model_path": "backend/models/sign_mlp_model.pkl",
  "label_map_path": "backend/models/label_map.json"
}
```

---

### 3. Supported Vocabulary
Returns human-readable titles and descriptions for all currently supported signs.

- **URL**: `/api/vocabulary`
- **Method**: `GET`
- **Response**:
```json
{
  "vocabulary": [
    {
      "label": "HELLO",
      "display_name": "Hello",
      "description": "Open hand with palm facing forward, fingers upright waving gently.",
      "supported": true
    }
  ],
  "total_signs": 8,
  "model_loaded": true
}
```

---

### 4. Recognize Gesture Frame
Processes a single base64 webcam frame through MediaPipe and the MLP classifier.

- **URL**: `/api/recognize`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "confidence_threshold": 0.75
}
```

- **Successful Response (Hand Detected & Classified)**:
```json
{
  "success": true,
  "hand_detected": true,
  "prediction": "HELLO",
  "raw_prediction": "HELLO",
  "confidence": 0.9412,
  "is_confident": true,
  "stable_prediction": true,
  "stable_label": "HELLO",
  "probabilities": {
    "HELLO": 0.9412,
    "HELP": 0.012,
    "I_LOVE_YOU": 0.005,
    "NO": 0.003,
    "PEACE": 0.008,
    "PLEASE": 0.015,
    "THANK_YOU": 0.011,
    "YES": 0.0048
  },
  "landmarks": [
    { "x": 0.521, "y": 0.712, "z": -0.01 }
  ],
  "message": "Recognized 'HELLO' with 94.1% confidence"
}
```

- **Response When No Hand is Present**:
```json
{
  "success": true,
  "hand_detected": false,
  "prediction": null,
  "raw_prediction": null,
  "confidence": 0.0,
  "is_confident": false,
  "stable_prediction": false,
  "stable_label": null,
  "probabilities": {},
  "landmarks": [],
  "message": "No hand detected in the frame."
}
```

---

### 5. Reset Prediction Smoothing
Clears the temporal smoothing window buffer.

- **URL**: `/api/recognize/reset`
- **Method**: `POST`
- **Response**:
```json
{
  "success": true,
  "message": "Smoothing buffer reset."
}
```

