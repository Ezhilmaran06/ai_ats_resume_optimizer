"""
Model Export and Compatibility Verification Tool:
Verifies that the trained model and label map are correctly packaged
and compatible with the FastAPI inference pipeline.
"""
import sys
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.inference.model_loader import GestureModel
from app.config import settings

def verify_and_export():
    print("=" * 60)
    print("    SignSpeak AI - Model Export & Integrity Check")
    print("=" * 60)

    loader = GestureModel(
        model_path=settings.MODEL_PATH,
        label_map_path=settings.LABEL_MAP_PATH
    )

    loaded = loader.load()
    if not loaded:
        print("[ERROR] Failed to load model or label map from backend/models/.")
        sys.exit(1)

    print(f"Model loaded: {loader.is_loaded}")
    print(f"Supported classes ({len(loader.labels)}): {loader.labels}")

    # Generate synthetic 63-dim test feature vector
    dummy_features = np.zeros(settings.EXPECTED_FEATURE_DIM, dtype=np.float32)
    try:
        label, conf, all_probs = loader.predict(dummy_features)
        print(f"\nTest prediction on 63-dim feature vector:")
        print(f"  - Predicted Label : {label}")
        print(f"  - Confidence      : {conf:.4f}")
        print(f"  - Probability Sum : {sum(all_probs.values()):.4f}")
        print("\n[SUCCESS] Model passes all inference compatibility checks!")
    except Exception as e:
        print(f"[ERROR] Inference test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_and_export()

