# System Architecture & Technical Design

## Overview

**SignSpeak AI** is a real-time sign language recognition and speech translation system. It converts live webcam hand gestures into structured text and synthesized speech.

The system is decoupled into two tiers:
1. **React Frontend**: Manages hardware webcam access, landmark visualization, state updates, sentence construction, and browser speech synthesis.
2. **FastAPI Backend**: Hosts the computer vision pipeline (MediaPipe Hands keypoint extraction, translation and scale invariant preprocessing) and the Multi-Layer Perceptron (MLP) classification engine.

---

## Architectural Data Flow

```text
                    USER
                     |
                     v
              REACT FRONTEND
                     |
             Webcam Permission
                     |
                     v
               LIVE VIDEO
                     |
        (Controlled ~10 FPS Capture)
                     |
                     v
             OPENCV PROCESSING
                     |
                     v
           MEDIAPIPE HAND DETECTION
                     |
                     v
            21 HAND LANDMARKS (x, y, z)
                     |
                     v
           FEATURE NORMALIZATION
            - Wrist Translation (0,0,0)
            - Scale Invariance (Max Dist = 1.0)
            - 63 Numerical Features
                     |
                     v
              TRAINED MLP MODEL
                     |
                     v
            GESTURE CLASSIFICATION
                     |
                     v
             CONFIDENCE FILTER (>= 75%)
                     |
                     v
             TEMPORAL SMOOTHING
            (4 Consecutive Window Check)
                     |
                     v
              PREDICTED SIGN
                     |
                     v
             SENTENCE BUILDER
            (Append, Space, Backspace, Clear)
                     |
                     v
              TEXT TO SPEECH
            (Browser SpeechSynthesis API)
```

---

## Component Details

### 1. Frontend Architecture
- **Webcam Engine (`useWebcam.js`)**: Leverages `navigator.mediaDevices.getUserMedia` for frame retrieval, device enumeration, and graceful error handling (`NotAllowedError`, `NotFoundError`, `NotReadableError`).
- **Landmark Overlay Canvas**: Dynamically renders the 21 MediaPipe hand keypoints and skeletal joints over the mirrored video feed.
- **Throttled Inference Controller**: Dispatches base64 frames to FastAPI at a controlled rate (~10 FPS) with concurrency locking (`isProcessingRef`) to prevent unbounded request queues.
- **Sentence Assembly & TTS**: Provides an interactive editor for assembling words, editing text, and speaking through `window.speechSynthesis`.

### 2. Backend & Computer Vision Architecture
- **Vision Pipeline (`app/vision/`)**:
  - `hand_detector.py`: Detects 21 3D hand landmarks using modern MediaPipe Tasks Vision API with legacy solutions fallback.
  - `landmark_utils.py`: Converts raw coordinates into translation- and scale-normalized 63-element feature vectors.
  - `preprocessing.py`: Base64 frame decoding and coordinate preprocessing.
- **Inference Pipeline (`app/inference/`)**:
  - `model_loader.py`: Singleton `GestureModel` loaded once into memory during FastAPI startup.
  - `predictor.py`: `PredictionSmoother` rolling buffer requiring consecutive matching frames to prevent prediction jitter.
- **API Routing (`app/api/`)**:
  - Validated Pydantic models with CORS support.

---

## Invariance & Feature Representation

Each detected hand yields 21 keypoints with spatial coordinates $(x_i, y_i, z_i)$.

1. **Translation Invariance**:
   $$\mathbf{p}'_i = \mathbf{p}_i - \mathbf{p}_0 \quad \text{for } i \in [0, 20]$$
   where $\mathbf{p}_0$ is the wrist landmark. This places the wrist at the origin $(0, 0, 0)$ regardless of the hand's location in the camera frame.

2. **Scale Invariance**:
   $$d_{\max} = \max_{i} \|\mathbf{p}'_i\|$$
   $$\mathbf{p}''_i = \frac{\mathbf{p}'_i}{d_{\max} + \epsilon}$$
   where $\epsilon = 10^{-6}$ avoids zero division. This ensures the numerical features remain identical whether the user is close to or far from the webcam.

3. **Feature Vector**:
   $$\mathbf{x} = [x''_0, y''_0, z''_0, x''_1, y''_1, z''_1, \dots, x''_{20}, y''_{20}, z''_{20}]^T \in \mathbb{R}^{63}$$

