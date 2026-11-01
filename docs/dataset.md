# Dataset Documentation

## Overview

SignSpeak AI classifies hand gestures based on 21 3D hand keypoints extracted by Google MediaPipe. Rather than relying on heavy raw video pixel arrays (which introduce lighting, background, and skin tone biases), the model operates purely on geometric spatial landmarks.

---

## Supported Vocabulary

The active model is trained on a defined vocabulary of 8 primary gestures:

| Index | Label | Display Name | Pose Description |
|:---:|:---|:---|:---|
| 0 | `HELLO` | Hello | Open hand with palm facing outward, all 5 fingers upright. |
| 1 | `HELP` | Help | Fist with thumb facing upward resting in a thumbs-up pose. |
| 2 | `I_LOVE_YOU` | I Love You | Thumb, index, and pinky extended; middle and ring folded. |
| 3 | `NO` | No | Index and middle fingers snapping down onto the thumb. |
| 4 | `PEACE` | Peace | Index and middle fingers extended upward in a 'V' formation. |
| 5 | `PLEASE` | Please | Flat open palm held gently toward chest. |
| 6 | `THANK_YOU` | Thank You | Flat open hand tilted forward from chin outward. |
| 7 | `YES` | Yes | Closed fist nodding agreement. |

---

## Dataset Format & Feature Representation

Each dataset sample is saved as a 64-column row in `backend/dataset/processed/gestures.csv`:

```text
f_0, f_1, f_2, ..., f_62, label
```

- Columns `f_0` to `f_62`: 63 normalized coordinates (21 landmarks $\times$ 3 coordinates: $x, y, z$).
- Column `label`: The categorical gesture name string.

### Preprocessing & Invariance Rules

The training data and live inference pipeline use the exact same normalization function (`app/vision/landmark_utils.py:normalize_landmarks`):
1. **Wrist Origin Alignment**: Landmark 0 (wrist) coordinate $(x_0, y_0, z_0)$ is subtracted from all 21 keypoints.
2. **Euclidean Scale Normalization**: Coordinates are divided by $\max_i \|\mathbf{p}_i - \mathbf{p}_0\| + 10^{-6}$.
3. **Array Flattening**: Converts the $(21, 3)$ matrix to a 1D vector of 63 float32 values.

---

## Collecting Custom Gesture Data

To expand the dataset with your own gestures using the webcam collector tool:

```bash
cd backend
python training/collect_data.py --label HELLO --samples 100 --camera 0
```

1. Hold your hand in the webcam viewport.
2. Press `s` to begin recording.
3. The tool captures 100 normalized landmark vectors and appends them to `dataset/processed/gestures.csv`.
4. Press `q` to exit.

## Generating the Benchmark Seed Dataset

If a webcam is not immediately connected or for CI/automated testing:

```bash
cd backend
python training/collect_data.py --generate-benchmark
```

Generates 800 samples (100 per class) with natural spatial jitter, rotation, scale, and translation variations.
