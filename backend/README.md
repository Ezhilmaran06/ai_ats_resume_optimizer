# SignSpeak AI — Backend Service

FastAPI-powered backend for real-time sign language recognition using MediaPipe Hands and an MLP Classifier.

## Prerequisites

- Python 3.10+ (Tested on Python 3.14)
- Virtual environment recommended

## Setup Instructions

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables (optional):
   ```bash
   copy .env.example .env
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

## Training Pipeline Commands

```bash
# 1. Collect custom gesture data via webcam
python training/collect_data.py --label HELLO --samples 100

# Or generate benchmark dataset
python training/collect_data.py --generate-benchmark

# 2. Extract landmarks from raw images if collected in dataset/raw/
python training/extract_landmarks.py

# 3. Train MLP model
python training/train_model.py

# 4. Standalone evaluation on test split
python training/evaluate_model.py

# 5. Export and compatibility verification
python training/export_model.py
```

## API Endpoints

- `GET /api/health` — Health check & model loaded state
- `GET /api/model/status` — Model metadata and supported vocabulary
- `GET /api/vocabulary` — List of supported gestures with descriptions
- `POST /api/recognize` — Single frame recognition (JSON payload with base64 image)
- `POST /api/recognize/reset` — Reset temporal smoothing window
- `GET /docs` — Interactive OpenAPI Swagger UI
