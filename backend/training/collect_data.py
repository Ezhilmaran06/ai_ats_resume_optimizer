"""
Dataset Collection Tool:
Captures live hand gestures via webcam, extracts MediaPipe landmarks,
normalizes features, and saves them to the dataset.
Also provides a benchmark generator for initialization without webcam.
"""
import argparse
import csv
import os
import sys
import time
from pathlib import Path
import cv2
import numpy as np
import mediapipe as mp

# Add parent directory to path to import app modules
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.vision.landmark_utils import extract_raw_landmarks_array, normalize_landmarks, TOTAL_FEATURES
from app.vision.hand_detector import HandDetector

DATASET_DIR = BASE_DIR / "dataset"
RAW_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"
CSV_PATH = PROCESSED_DIR / "gestures.csv"

SUPPORTED_VOCABULARY = [
    "HELLO",
    "THANK_YOU",
    "YES",
    "NO",
    "I_LOVE_YOU",
    "PLEASE",
    "HELP",
    "PEACE"
]

def ensure_dirs():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

def append_sample_to_csv(label: str, features: np.ndarray):
    """Appends a 63-element feature row with label to gestures.csv."""
    write_header = not CSV_PATH.exists() or os.path.getsize(CSV_PATH) == 0
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if write_header:
            header = [f"f_{i}" for i in range(TOTAL_FEATURES)] + ["label"]
            writer.writerow(header)
        row = list(features) + [label]
        writer.writerow(row)

def collect_from_webcam(label: str, num_samples: int = 100, camera_id: int = 0):
    """
    Opens the webcam, provides a countdown, and captures hand landmark features.
    """
    ensure_dirs()
    print(f"\n==========================================")
    print(f"  SignSpeak AI - Gesture Data Collector  ")
    print(f"  Target Gesture : {label}")
    print(f"  Target Samples : {num_samples}")
    print(f"==========================================")
    print("Press 's' to start capturing, 'q' to quit.")

    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera {camera_id}.")
        return

    detector = HandDetector()

    capturing = False
    count = 0

    while cap.isOpened() and count < num_samples:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to read frame.")
            break

        frame = cv2.flip(frame, 1)
        landmarks = detector.find_hand_landmarks(frame)

        annotated = frame.copy()
        hand_detected = landmarks is not None

        if hand_detected:
            if capturing:
                raw_coords = extract_raw_landmarks_array(landmarks)
                if raw_coords is not None:
                    features = normalize_landmarks(raw_coords)
                    append_sample_to_csv(label, features)
                    count += 1
                    time.sleep(0.04)

        status_text = f"Collecting: {count}/{num_samples}" if capturing else "Press 's' to start"
        color = (0, 255, 0) if capturing else (0, 165, 255)
        cv2.putText(annotated, f"Gesture: {label}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(annotated, status_text, (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        cv2.putText(annotated, f"Hand: {'DETECTED' if hand_detected else 'SEARCHING'}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0) if hand_detected else (0, 0, 255), 2)

        cv2.imshow("SignSpeak AI - Data Collector", annotated)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("\nCollection cancelled by user.")
            break
        elif key == ord('s'):
            capturing = True
            print("\nCapturing started...")

    cap.release()
    cv2.destroyAllWindows()
    detector.close()
    print(f"\n[SUCCESS] Collected {count} samples for gesture '{label}'. Saved to {CSV_PATH}")

def generate_benchmark_dataset(samples_per_class: int = 150):
    """
    Generates a consistent landmark dataset for the supported vocabulary
    using realistic 3D anatomical keypoint archetypes with Gaussian variation.
    This guarantees that the training pipeline and model export run accurately out-of-the-box.
    """
    ensure_dirs()
    print(f"\nGenerating benchmark dataset for {len(SUPPORTED_VOCABULARY)} gestures ({samples_per_class} samples each)...")
    np.random.seed(42)

    # Base hand template (21 landmarks)
    # 0: Wrist, 1-4: Thumb, 5-8: Index, 9-12: Middle, 13-16: Ring, 17-20: Pinky
    def create_archetype(name: str) -> np.ndarray:
        coords = np.zeros((21, 3), dtype=np.float32)
        # Wrist at origin
        coords[0] = [0.5, 0.8, 0.0]
        # MCP joints
        coords[1] = [0.42, 0.72, -0.02]  # Thumb CMC
        coords[2] = [0.38, 0.64, -0.04]  # Thumb MCP
        coords[5] = [0.44, 0.55, -0.01]  # Index MCP
        coords[9] = [0.50, 0.54, -0.01]  # Middle MCP
        coords[13] = [0.56, 0.56, -0.01] # Ring MCP
        coords[17] = [0.62, 0.60, -0.01] # Pinky MCP

        if name == "HELLO":
            # All fingers extended upright
            coords[3] = [0.35, 0.55, -0.05]
            coords[4] = [0.32, 0.48, -0.06] # Thumb TIP
            coords[6] = [0.43, 0.42, -0.01]; coords[7] = [0.42, 0.32, -0.01]; coords[8] = [0.41, 0.22, -0.01] # Index TIP
            coords[10] = [0.50, 0.40, -0.01]; coords[11] = [0.50, 0.30, -0.01]; coords[12] = [0.50, 0.20, -0.01] # Middle TIP
            coords[14] = [0.57, 0.42, -0.01]; coords[15] = [0.58, 0.32, -0.01]; coords[16] = [0.59, 0.23, -0.01] # Ring TIP
            coords[18] = [0.64, 0.48, -0.01]; coords[19] = [0.65, 0.40, -0.01]; coords[20] = [0.66, 0.32, -0.01] # Pinky TIP
        elif name == "PEACE":
            # Index & Middle extended in V, Ring & Pinky & Thumb folded
            coords[3] = [0.44, 0.64, 0.03]; coords[4] = [0.46, 0.62, 0.04]
            coords[6] = [0.41, 0.42, -0.01]; coords[7] = [0.38, 0.32, -0.01]; coords[8] = [0.35, 0.22, -0.01] # Index V left
            coords[10] = [0.52, 0.42, -0.01]; coords[11] = [0.55, 0.32, -0.01]; coords[12] = [0.58, 0.22, -0.01] # Middle V right
            coords[14] = [0.55, 0.62, 0.03]; coords[15] = [0.54, 0.66, 0.04]; coords[16] = [0.53, 0.68, 0.05] # Ring folded
            coords[18] = [0.60, 0.65, 0.03]; coords[19] = [0.59, 0.68, 0.04]; coords[20] = [0.58, 0.70, 0.05] # Pinky folded
        elif name == "I_LOVE_YOU":
            # Thumb, Index, Pinky extended; Middle & Ring folded
            coords[3] = [0.34, 0.55, -0.03]; coords[4] = [0.30, 0.46, -0.04] # Thumb out
            coords[6] = [0.43, 0.42, -0.01]; coords[7] = [0.42, 0.32, -0.01]; coords[8] = [0.41, 0.22, -0.01] # Index up
            coords[10] = [0.49, 0.60, 0.03]; coords[11] = [0.49, 0.64, 0.04]; coords[12] = [0.49, 0.67, 0.05] # Middle folded
            coords[14] = [0.55, 0.61, 0.03]; coords[15] = [0.55, 0.65, 0.04]; coords[16] = [0.55, 0.68, 0.05] # Ring folded
            coords[18] = [0.64, 0.48, -0.01]; coords[19] = [0.66, 0.40, -0.01]; coords[20] = [0.68, 0.32, -0.01] # Pinky up
        elif name == "YES":
            # Closed fist nodding (all fingers folded into palm)
            coords[3] = [0.44, 0.60, 0.03]; coords[4] = [0.48, 0.60, 0.04] # Thumb over fist
            coords[6] = [0.45, 0.60, 0.02]; coords[7] = [0.46, 0.65, 0.04]; coords[8] = [0.46, 0.69, 0.05]
            coords[10] = [0.51, 0.60, 0.02]; coords[11] = [0.51, 0.65, 0.04]; coords[12] = [0.51, 0.69, 0.05]
            coords[14] = [0.56, 0.61, 0.02]; coords[15] = [0.56, 0.66, 0.04]; coords[16] = [0.56, 0.70, 0.05]
            coords[18] = [0.61, 0.63, 0.02]; coords[19] = [0.61, 0.67, 0.04]; coords[20] = [0.61, 0.71, 0.05]
        elif name == "NO":
            # Index and Middle snapping onto Thumb, others folded
            coords[3] = [0.44, 0.52, -0.01]; coords[4] = [0.46, 0.48, 0.0]  # Thumb meeting index
            coords[6] = [0.44, 0.48, 0.0]; coords[7] = [0.45, 0.49, 0.01]; coords[8] = [0.46, 0.50, 0.01] # Index tip touching
            coords[10] = [0.48, 0.49, 0.0]; coords[11] = [0.48, 0.51, 0.01]; coords[12] = [0.48, 0.52, 0.01] # Middle tip touching
            coords[14] = [0.56, 0.62, 0.03]; coords[15] = [0.56, 0.67, 0.04]; coords[16] = [0.56, 0.70, 0.05] # Ring folded
            coords[18] = [0.62, 0.64, 0.03]; coords[19] = [0.62, 0.68, 0.04]; coords[20] = [0.62, 0.72, 0.05] # Pinky folded
        elif name == "THANK_YOU":
            # Flat palm tilted slightly forward/up
            coords[3] = [0.40, 0.56, -0.03]; coords[4] = [0.38, 0.50, -0.04]
            coords[6] = [0.45, 0.44, -0.08]; coords[7] = [0.46, 0.35, -0.14]; coords[8] = [0.47, 0.26, -0.20]
            coords[10] = [0.51, 0.42, -0.08]; coords[11] = [0.52, 0.33, -0.14]; coords[12] = [0.53, 0.24, -0.20]
            coords[14] = [0.57, 0.44, -0.08]; coords[15] = [0.58, 0.35, -0.14]; coords[16] = [0.59, 0.26, -0.20]
            coords[18] = [0.63, 0.48, -0.07]; coords[19] = [0.64, 0.41, -0.13]; coords[20] = [0.65, 0.34, -0.18]
        elif name == "HELP":
            # Thumbs up hand pose
            coords[3] = [0.40, 0.60, -0.03]; coords[4] = [0.38, 0.48, -0.06] # Thumb pointing straight UP
            coords[6] = [0.46, 0.60, 0.02]; coords[7] = [0.48, 0.64, 0.04]; coords[8] = [0.48, 0.68, 0.05]
            coords[10] = [0.51, 0.60, 0.02]; coords[11] = [0.52, 0.65, 0.04]; coords[12] = [0.52, 0.69, 0.05]
            coords[14] = [0.56, 0.61, 0.02]; coords[15] = [0.57, 0.66, 0.04]; coords[16] = [0.57, 0.70, 0.05]
            coords[18] = [0.61, 0.63, 0.02]; coords[19] = [0.62, 0.67, 0.04]; coords[20] = [0.62, 0.71, 0.05]
        else: # PLEASE
            # Open flat palm tilted toward chest
            coords[3] = [0.38, 0.58, 0.01]; coords[4] = [0.36, 0.52, 0.02]
            coords[6] = [0.45, 0.45, 0.02]; coords[7] = [0.46, 0.36, 0.03]; coords[8] = [0.47, 0.28, 0.04]
            coords[10] = [0.51, 0.43, 0.02]; coords[11] = [0.52, 0.34, 0.03]; coords[12] = [0.53, 0.26, 0.04]
            coords[14] = [0.56, 0.45, 0.02]; coords[15] = [0.57, 0.36, 0.03]; coords[16] = [0.58, 0.28, 0.04]
            coords[18] = [0.61, 0.49, 0.02]; coords[19] = [0.62, 0.42, 0.03]; coords[20] = [0.63, 0.35, 0.04]

        return coords

    # Clear old CSV
    if CSV_PATH.exists():
        CSV_PATH.unlink()

    total_samples = 0
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        header = [f"f_{i}" for i in range(TOTAL_FEATURES)] + ["label"]
        writer.writerow(header)

        for vocab in SUPPORTED_VOCABULARY:
            archetype = create_archetype(vocab)
            for _ in range(samples_per_class):
                # Add natural human hand jitter & anatomical variation
                noise = np.random.normal(0, 0.012, size=archetype.shape).astype(np.float32)
                # Random slight rotation
                angle = np.random.uniform(-0.15, 0.15)
                cos_a, sin_a = np.cos(angle), np.sin(angle)
                rot_matrix = np.array([[cos_a, -sin_a, 0], [sin_a, cos_a, 0], [0, 0, 1]], dtype=np.float32)
                
                jittered = np.dot(archetype + noise, rot_matrix)
                # Random translation to test translation invariance
                jittered += np.random.uniform(-0.2, 0.2, size=(1, 3))
                # Random scaling to test scale invariance
                jittered *= np.random.uniform(0.8, 1.25)
                
                features = normalize_landmarks(jittered)
                writer.writerow(list(features) + [vocab])
                total_samples += 1

    print(f"[SUCCESS] Benchmark dataset generated: {total_samples} samples across {len(SUPPORTED_VOCABULARY)} gestures.")
    print(f"Saved to: {CSV_PATH}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SignSpeak AI Gesture Data Collector")
    parser.add_argument("--label", type=str, choices=SUPPORTED_VOCABULARY, help="Gesture label to collect")
    parser.add_argument("--samples", type=int, default=100, help="Number of samples to collect")
    parser.add_argument("--camera", type=int, default=0, help="Webcam device ID (default 0)")
    parser.add_argument("--generate-benchmark", action="store_true", help="Generate benchmark dataset")

    args = parser.parse_args()

    if args.generate_benchmark:
        generate_benchmark_dataset(samples_per_class=args.samples if args.samples else 150)
    elif args.label:
        collect_from_webcam(args.label, num_samples=args.samples, camera_id=args.camera)
    else:
        print("Usage:")
        print("  python training/collect_data.py --generate-benchmark")
        print("  python training/collect_data.py --label HELLO --samples 100")
        print(f"Supported labels: {', '.join(SUPPORTED_VOCABULARY)}")
