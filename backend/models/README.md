# Models Directory

This directory stores the trained model artifacts and associated metadata for SignSpeak AI.

## Files

- `sign_mlp_model.pkl`: Serialized Multi-Layer Perceptron (MLP) classifier weights trained on normalized 63-dimensional MediaPipe hand landmarks.
- `label_map.json`: Mapping of class index integers to human-readable gesture strings (e.g. `{"0": "HELLO", "1": "HELP", ...}`).
- `training_metrics.json`: Detailed evaluation metrics recorded from the held-out test dataset, including accuracy, precision, recall, F1-scores, and confusion matrix.

## Loading Lifecycle

Models are loaded once into memory during the FastAPI lifespan startup in `app/inference/model_loader.py`. If files are missing, the backend reports `model_loaded: false` through `/api/health` and `/api/model/status` without crashing.
