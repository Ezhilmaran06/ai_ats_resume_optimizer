"""
Landmark Extraction Tool:
Processes raw image folders in dataset/raw/<label>/, detects hand keypoints via MediaPipe,
normalizes features, and exports to dataset/processed/gestures.csv.
"""
import csv
import sys
from pathlib import Path
import cv2
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.vision.hand_detector import HandDetector
from app.vision.preprocessing import preprocess_landmarks
from app.vision.landmark_utils import TOTAL_FEATURES

RAW_DIR = BASE_DIR / "dataset" / "raw"
PROCESSED_DIR = BASE_DIR / "dataset" / "processed"
CSV_PATH = PROCESSED_DIR / "gestures.csv"

def extract_landmarks_from_raw():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    
    if not RAW_DIR.exists():
        print(f"[INFO] Raw directory {RAW_DIR} does not exist. Nothing to extract.")
        return

    detector = HandDetector()
    label_dirs = [d for d in RAW_DIR.iterdir() if d.is_dir()]

    if not label_dirs:
        print(f"[INFO] No label subdirectories found in {RAW_DIR}.")
        return

    print(f"Found {len(label_dirs)} label folders in {RAW_DIR}...")
    
    # Check if CSV exists to decide on header
    write_header = not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0
    total_extracted = 0
    total_skipped = 0

    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if write_header:
            header = [f"f_{i}" for i in range(TOTAL_FEATURES)] + ["label"]
            writer.writerow(header)

        for label_dir in label_dirs:
            label = label_dir.name
            image_files = list(label_dir.glob("*.jpg")) + list(label_dir.glob("*.png")) + list(label_dir.glob("*.jpeg"))
            print(f"Processing '{label}' ({len(image_files)} images)...")

            class_extracted = 0
            for img_path in image_files:
                img = cv2.imread(str(img_path))
                if img is None:
                    total_skipped += 1
                    continue

                landmarks = detector.find_hand_landmarks(img)
                if landmarks is None:
                    total_skipped += 1
                    continue

                features, _ = preprocess_landmarks(landmarks)
                if features is not None and len(features) == TOTAL_FEATURES:
                    writer.writerow(list(features) + [label])
                    class_extracted += 1
                    total_extracted += 1
                else:
                    total_skipped += 1

            print(f" -> Extracted {class_extracted}/{len(image_files)} valid samples for '{label}'.")

    detector.close()
    print(f"\n[DONE] Extraction complete: {total_extracted} extracted, {total_skipped} skipped/no-hand.")
    print(f"Dataset path: {CSV_PATH}")

if __name__ == "__main__":
    extract_landmarks_from_raw()

