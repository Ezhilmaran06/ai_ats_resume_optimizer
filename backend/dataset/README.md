# Dataset Directory

Stores raw and processed gesture data used for training and evaluating the SignSpeak AI model.

## Directory Structure

```text
dataset/
├── raw/            # Optional raw camera frames organized by gesture class: raw/<label>/*.jpg
├── processed/      # Extracted, normalized feature files
│   ├── gestures.csv    # 63 landmark coordinates (f_0 .. f_62) + label column
│   └── test_split.pkl  # Held-out stratified test set for evaluation
└── README.md
```

## Feature Representation

Each sample contains **63 normalized numerical features**:
- 21 3D hand keypoints (x, y, z) detected via MediaPipe Hands.
- **Translation Invariance**: Wrist landmark (index 0) shifted to origin `(0, 0, 0)`.
- **Scale Invariance**: Coordinates divided by the maximum Euclidean distance from the wrist to any landmark.

## Data Collection

Collect custom gestures using:
```bash
python training/collect_data.py --label HELLO --samples 100
```
Or generate the benchmark dataset:
```bash
python training/collect_data.py --generate-benchmark
```

