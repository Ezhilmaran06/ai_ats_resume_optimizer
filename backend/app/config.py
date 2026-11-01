import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    APP_NAME: str = "SignSpeak AI Backend"
    APP_VERSION: str = "1.0.0"
    BASE_DIR: Path = BASE_DIR
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Model and threshold
    MIN_CONFIDENCE_THRESHOLD: float = float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.75"))
    PREDICTION_STABILITY_FRAMES: int = int(os.getenv("PREDICTION_STABILITY_FRAMES", "4"))
    
    # Paths
    MODEL_PATH: Path = BASE_DIR / "models" / "sign_mlp_model.pkl"
    LABEL_MAP_PATH: Path = BASE_DIR / "models" / "label_map.json"
    TASK_MODEL_PATH: Path = BASE_DIR / "models" / "hand_landmarker.task"
    
    # MediaPipe Hand settings
    MAX_NUM_HANDS: int = 1
    MIN_DETECTION_CONFIDENCE: float = 0.6
    MIN_TRACKING_CONFIDENCE: float = 0.5
    
    # Feature vector dimension: 21 landmarks * 3 coords = 63
    EXPECTED_FEATURE_DIM: int = 63

settings = Settings()
