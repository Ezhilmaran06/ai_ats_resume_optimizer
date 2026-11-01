"""
Model Evaluation Tool:
Loads trained MLP model and evaluates test metrics against held-out split.
"""
import json
import sys
from pathlib import Path
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

PROCESSED_DIR = BASE_DIR / "dataset" / "processed"
TEST_DATA_PATH = PROCESSED_DIR / "test_split.pkl"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "sign_mlp_model.pkl"
LABEL_MAP_PATH = MODELS_DIR / "label_map.json"

def evaluate():
    print("=" * 60)
    print("      SignSpeak AI - Standalone Model Evaluation")
    print("=" * 60)

    if not MODEL_PATH.exists():
        print(f"[ERROR] Trained model not found at {MODEL_PATH}.")
        sys.exit(1)

    if not LABEL_MAP_PATH.exists():
        print(f"[ERROR] Label map not found at {LABEL_MAP_PATH}.")
        sys.exit(1)

    if not TEST_DATA_PATH.exists():
        print(f"[ERROR] Test split not found at {TEST_DATA_PATH}.")
        print("Run 'python training/train_model.py' first.")
        sys.exit(1)

    # Load artifacts
    model = joblib.load(MODEL_PATH)
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        label_map = {int(k): v for k, v in json.load(f).items()}

    test_data = joblib.load(TEST_DATA_PATH)
    X_test = test_data["X_test"]
    y_test = test_data["y_test"]

    print(f"Evaluating model on {len(X_test)} held-out test samples...")
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    conf_mat = confusion_matrix(y_test, y_pred)

    class_names = [label_map[i] for i in sorted(label_map.keys())]

    print("\n" + "=" * 60)
    print(f"Test Accuracy  : {acc * 100:.2f}%")
    print(f"Test Precision : {prec * 100:.2f}%")
    print(f"Test Recall    : {rec * 100:.2f}%")
    print(f"Test F1-Score  : {f1 * 100:.2f}%")
    print("=" * 60)
    print("\nDetailed Per-Class Breakdown:\n")
    print(classification_report(y_test, y_pred, target_names=class_names, zero_division=0))
    print("Confusion Matrix:\n")
    print(conf_mat)
    print("\n[SUCCESS] Model evaluation passed.")

if __name__ == "__main__":
    evaluate()

