"""
Model Training Pipeline:
Trains a Multi-Layer Perceptron (MLP) Classifier on normalized 63-element hand landmarks.
Evaluates accuracy, precision, recall, F1-score, and confusion matrix.
Saves model weights and label mapping to backend/models/.
"""
import argparse
import json
import os
import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.vision.landmark_utils import TOTAL_FEATURES

PROCESSED_DIR = BASE_DIR / "dataset" / "processed"
CSV_PATH = PROCESSED_DIR / "gestures.csv"
TEST_DATA_PATH = PROCESSED_DIR / "test_split.pkl"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "sign_mlp_model.pkl"
LABEL_MAP_PATH = MODELS_DIR / "label_map.json"
METRICS_PATH = MODELS_DIR / "training_metrics.json"

def train(
    hidden_layers=(128, 64),
    max_iter=500,
    learning_rate_init=0.001,
    test_size=0.2,
    val_size=0.1,
    random_state=42
):
    print("=" * 60)
    print("     SignSpeak AI - MLP Model Training Pipeline")
    print("=" * 60)

    if not CSV_PATH.exists():
        print(f"[ERROR] Dataset not found at {CSV_PATH}.")
        print("Run 'python training/collect_data.py --generate-benchmark' first to create a dataset.")
        sys.exit(1)

    # 1. Load Dataset
    print(f"[1/6] Loading dataset from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    print(f"Total rows: {len(df)}")

    # 2. Validate features and labels
    print("[2/6] Validating dataset integrity...")
    feature_cols = [f"f_{i}" for i in range(TOTAL_FEATURES)]
    missing_cols = [col for col in feature_cols if col not in df.columns]
    if missing_cols or "label" not in df.columns:
        print(f"[ERROR] Missing required columns in dataset: {missing_cols}")
        sys.exit(1)

    # Drop rows with NaN
    clean_df = df.dropna(subset=feature_cols + ["label"])
    if len(clean_df) != len(df):
        print(f"[WARN] Dropped {len(df) - len(clean_df)} invalid rows containing NaNs.")

    X = clean_df[feature_cols].values.astype(np.float32)
    y_raw = clean_df["label"].values.astype(str)

    # Check minimum class counts
    unique_labels, counts = np.unique(y_raw, return_counts=True)
    print(f"Detected {len(unique_labels)} gesture classes:")
    for lbl, cnt in zip(unique_labels, counts):
        print(f"  - {lbl}: {cnt} samples")

    if len(unique_labels) < 2:
        print("[ERROR] Training requires at least 2 distinct classes.")
        sys.exit(1)

    # 3. Label encoding
    print("[3/6] Encoding label mapping...")
    label_to_idx = {label: idx for idx, label in enumerate(sorted(unique_labels))}
    idx_to_label = {idx: label for label, idx in label_to_idx.items()}
    y = np.array([label_to_idx[l] for l in y_raw], dtype=np.int32)

    # 4. Train / Test / Validation Split (Stratified to prevent leakage)
    print(f"[4/6] Splitting dataset (Train: {1 - test_size - val_size:.0%}, Val: {val_size:.0%}, Test: {test_size:.0%})...")
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Secondary split for validation
    val_ratio_of_train_val = val_size / (1.0 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=val_ratio_of_train_val, random_state=random_state, stratify=y_train_val
    )

    print(f"Split sizes: Train={len(X_train)}, Validation={len(X_val)}, Test={len(X_test)}")

    # Save test set for standalone evaluate_model.py
    joblib.dump({"X_test": X_test, "y_test": y_test, "label_map": idx_to_label}, TEST_DATA_PATH)

    # 5. Train MLP Classifier
    print(f"[5/6] Training MLP Classifier (Architecture: {hidden_layers}, max_iter={max_iter}, lr={learning_rate_init})...")
    clf = MLPClassifier(
        hidden_layer_sizes=hidden_layers,
        activation="relu",
        solver="adam",
        alpha=0.0001,
        batch_size=32,
        learning_rate_init=learning_rate_init,
        max_iter=max_iter,
        early_stopping=True,
        n_iter_no_change=20,
        random_state=random_state,
        verbose=False
    )

    clf.fit(X_train, y_train)

    # Validation evaluation
    val_pred = clf.predict(X_val)
    val_acc = accuracy_score(y_val, val_pred)
    print(f"Validation Accuracy: {val_acc * 100:.2f}%")

    # 6. Test Evaluation
    print("\n[6/6] Evaluating on held-out test set...")
    test_pred = clf.predict(X_test)
    test_acc = accuracy_score(y_test, test_pred)
    test_prec = precision_score(y_test, test_pred, average="weighted", zero_division=0)
    test_rec = recall_score(y_test, test_pred, average="weighted", zero_division=0)
    test_f1 = f1_score(y_test, test_pred, average="weighted", zero_division=0)
    conf_mat = confusion_matrix(y_test, test_pred)

    class_names = [idx_to_label[i] for i in range(len(unique_labels))]
    report_dict = classification_report(y_test, test_pred, target_names=class_names, output_dict=True, zero_division=0)

    print("\n" + "=" * 60)
    print("                MODEL EVALUATION RESULTS")
    print("=" * 60)
    print(f"  Accuracy  : {test_acc * 100:.2f}%")
    print(f"  Precision : {test_prec * 100:.2f}%")
    print(f"  Recall    : {test_rec * 100:.2f}%")
    print(f"  F1-Score  : {test_f1 * 100:.2f}%")
    print("=" * 60)
    print("\nClassification Report:\n")
    print(classification_report(y_test, test_pred, target_names=class_names, zero_division=0))

    # Save artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"Saved model to: {MODEL_PATH}")

    with open(LABEL_MAP_PATH, "w", encoding="utf-8") as f:
        # JSON serializable format: {"0": "HELLO", "1": "THANK_YOU", ...}
        json.dump({str(k): v for k, v in idx_to_label.items()}, f, indent=2)
    print(f"Saved label map to: {LABEL_MAP_PATH}")

    metrics_summary = {
        "model_type": "MLPClassifier",
        "hidden_layers": list(hidden_layers),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "classes": class_names,
        "test_accuracy": round(float(test_acc), 4),
        "test_precision": round(float(test_prec), 4),
        "test_recall": round(float(test_rec), 4),
        "test_f1": round(float(test_f1), 4),
        "confusion_matrix": conf_mat.tolist(),
        "per_class": {
            cls: {
                "precision": round(report_dict[cls]["precision"], 4),
                "recall": round(report_dict[cls]["recall"], 4),
                "f1": round(report_dict[cls]["f1-score"], 4),
                "support": report_dict[cls]["support"]
            }
            for cls in class_names if cls in report_dict
        }
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"Saved metrics summary to: {METRICS_PATH}")
    print("\n[SUCCESS] Model training complete and exported.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SignSpeak AI Model Training Pipeline")
    parser.add_argument("--layers", type=int, nargs="+", default=[128, 64], help="Hidden layer sizes")
    parser.add_argument("--epochs", type=int, default=500, help="Max iterations")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    args = parser.parse_args()

    train(hidden_layers=tuple(args.layers), max_iter=args.epochs, learning_rate_init=args.lr)

