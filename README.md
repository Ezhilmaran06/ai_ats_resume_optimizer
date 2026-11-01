# SignSpeak AI — Real-Time Sign Language Recognition and Speech Translation Using Deep Learning

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?logo=react)](https://react.dev)
[![MediaPipe](https://img.shields.io/badge/Vision-Google_MediaPipe-0078D4.svg)](https://developers.google.com/mediapipe)
[![Scikit-Learn](https://img.shields.io/badge/AI-MLP_Neural_Classifier-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Abstract

**SignSpeak AI** is an intelligent assistive technology system designed to bridge the communication barrier between individuals who communicate using sign language and the broader non-signing community. By utilizing standard consumer webcams, Google MediaPipe 3D hand tracking, and a Multi-Layer Perceptron (MLP) deep learning classifier, the system captures hand gestures in real time, extracts 21 spatial keypoints, translates recognized signs into coherent text, and synthesizes natural speech output via the Web Speech API.

---

## 2. Problem Statement

Sign language is a primary mode of communication for millions of deaf and hard-of-hearing individuals worldwide. However, because the vast majority of hearing individuals are not fluent in sign language, deaf individuals frequently encounter formidable obstacles in everyday communication, education, healthcare, and employment. Dedicated hardware sensors (such as data gloves or depth cameras) are costly and inconvenient. An accessible, vision-based web application that operates seamlessly on standard webcams empowers spontaneous interaction without specialized hardware.

---

## 3. Project Objectives

1. **Hardware-Free Capture**: Ingest live video streams directly via standard browser webcam APIs.
2. **Keypoint Extraction**: Detect hands and accurately extract 21 3D spatial landmarks $(x, y, z)$.
3. **Invariant Normalization**: Transform keypoints to be translation- and scale-invariant, ensuring uniform classification across different distances and hand positions.
4. **Real-Time Classification**: Execute lightweight, high-accuracy inference with latency $< 5\text{ms}$ on CPU.
5. **Temporal Stability Filtering**: Employ rolling buffer smoothing to eliminate transient prediction jitter.
6. **Sentence Construction**: Provide an interactive editor to assemble, edit, space, backspace, and clear recognized words.
7. **Speech Translation**: Convert generated sentences into audible synthesized speech with selectable voices.
8. **Privacy Guarantee**: Perform all processing locally without streaming video frames to external third-party servers.

---

## 4. Key Features

- **Live Webcam Studio**: Start/stop camera feeds, switch input devices, and toggle a 21-joint skeleton wireframe.
- **Visual Confidence Gauges**: Real-time confidence bar with configurable minimum threshold indicator.
- **Probability Breakdown**: Real-time distribution across all supported gesture classes.
- **Interactive Sentence Builder**:
  - `[ + Add Sign ]`
  - `[ Space ]`
  - `[ ⌫ Backspace ]`
  - `[ Clear ]`
  - `[ 🔊 Speak Sentence ]`
  - `[ ⏹ Stop Speech ]`
  - Auto-Append toggle for sustained stable gestures.
- **Multi-Voice Text-to-Speech**: Integrates with browser speech synthesis engines with customizable rate and pitch.
- **Modular Data Collection & Retraining Pipeline**: Built-in CLI tools to collect custom gesture datasets and retrain the classifier.

---

## 5. System Architecture

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

## 6. Technology Stack

### Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite 5
- **Styling**: Modern Pure CSS3 (Responsive Grid/Flexbox, Custom Properties; No Tailwind)
- **APIs**: HTML5 MediaDevices / getUserMedia, Web Speech API (SpeechSynthesis)

### Backend & AI
- **Language**: Python 3.10+ (Tested on Python 3.14)
- **Web Framework**: FastAPI & Uvicorn
- **Computer Vision**: OpenCV (cv2) & Google MediaPipe Tasks Vision / Solutions
- **Deep Learning / ML**: Scikit-Learn (Multi-Layer Perceptron), NumPy, Pandas
- **Model Storage**: Joblib & JSON

---

## 7. Project Structure

```text
ai_ats_resume_optimizer/
│
├── frontend/                     # React + Vite web application
│   ├── public/assets/            # Static assets and icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header navigation & service status indicator
│   │   │   ├── WebcamPanel.jsx       # Camera view, landmark canvas & controls
│   │   │   ├── PredictionPanel.jsx   # Current sign display & class probabilities
│   │   │   ├── SentenceBuilder.jsx   # Text assembly, controls & text-to-speech
│   │   │   ├── ConfidenceIndicator.jsx # Visual confidence gauge
│   │   │   ├── SupportedSigns.jsx    # Supported gesture vocabulary cards
│   │   │   ├── HowItWorks.jsx        # Architectural pipeline overview
│   │   │   ├── AboutSection.jsx      # Problem statement & scope limitations
│   │   │   └── StatusMessage.jsx     # Alert & status banners
│   │   ├── services/
│   │   │   └── api.js                # Centralized FastAPI client
│   │   ├── hooks/
│   │   │   └── useWebcam.js          # Hardware webcam access and frame capture
│   │   ├── App.jsx                   # Main application coordinator
│   │   ├── App.css                   # Custom responsive styling
│   │   ├── index.css                 # Base resets and CSS variables
│   │   └── main.jsx                  # React entry point
│   ├── tests/
│   │   └── frontend.test.js          # Unit tests (Node.js test runner)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python FastAPI server & ML pipeline
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point & lifespan loader
│   │   ├── config.py                 # Pydantic configuration & environment settings
│   │   ├── api/
│   │   │   ├── routes.py             # Health, status, vocabulary & recognize routes
│   │   │   └── schemas.py            # Pydantic request & response models
│   │   ├── vision/
│   │   │   ├── hand_detector.py      # MediaPipe HandLandmarker wrapper
│   │   │   ├── landmark_utils.py     # 21-keypoint extraction & normalization
│   │   │   └── preprocessing.py      # Base64 image decoding pipeline
│   │   ├── inference/
│   │   │   ├── model_loader.py       # In-memory model singleton
│   │   │   └── predictor.py          # Temporal smoothing & confidence filtering
│   │   ├── services/
│   │   │   └── recognition_service.py # Vision + inference orchestration
│   │   └── utils/
│   │       └── validation.py         # Shape and label validation helpers
│   ├── models/
│   │   ├── sign_mlp_model.pkl        # Serialized MLP model weights
│   │   ├── label_map.json            # Class index to gesture name mapping
│   │   ├── hand_landmarker.task      # MediaPipe Tasks vision model asset
│   │   ├── training_metrics.json     # Test evaluation results
│   │   └── README.md
│   ├── dataset/
│   │   ├── raw/                      # Optional raw image captures
│   │   ├── processed/                # Extracted 63-feature CSV & test splits
│   │   └── README.md
│   ├── training/
│   │   ├── collect_data.py           # Webcam data collector & benchmark generator
│   │   ├── extract_landmarks.py      # Batch keypoint extraction from raw images
│   │   ├── train_model.py            # MLP neural network training pipeline
│   │   ├── evaluate_model.py         # Standalone test set evaluation
│   │   └── export_model.py           # Model packaging & compatibility verification
│   ├── tests/
│   │   └── test_backend.py           # Pytest backend and API tests
│   ├── requirements.txt
│   └── README.md
│
├── docs/                         # Technical documentation
│   ├── architecture.md           # Deep dive into dataflow and normalization
│   ├── dataset.md                # Dataset structure and collection guidelines
│   ├── model_training.md         # MLP architecture and training procedures
│   └── api_documentation.md      # OpenAPI specification and endpoint examples
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Comprehensive ignore rules
├── LICENSE                       # MIT License
└── README.md
```

---

## 8. Supported Gesture Vocabulary

The active model classifies the following **8 high-impact gestures**:

| Gesture | Label | Visual Description |
|:---|:---:|:---|
| **Hello** | `HELLO` | Open hand with palm forward, fingers upright waving gently |
| **Thank You** | `THANK_YOU` | Open flat palm moving forward from chin/mouth outward |
| **Yes** | `YES` | Closed fist nodding up and down |
| **No** | `NO` | Index and middle fingers snapping down onto thumb |
| **I Love You** | `I_LOVE_YOU` | Thumb, index, and pinky extended; middle and ring folded |
| **Please** | `PLEASE` | Open flat palm circular motion toward chest |
| **Help** | `HELP` | Upright thumbs-up fist resting on flat open palm |
| **Peace** | `PEACE` | Index and middle fingers extended upward in a 'V' shape |

---

## 9. Installation & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22 tested)
- **Python**: 3.10 or higher (Python 3.14 tested)
- **Webcam**: Standard USB or integrated camera

---

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/Ezhilmaran06/ai_ats_resume_optimizer.git
cd ai_ats_resume_optimizer
copy .env.example .env
```

---

### Step 2: Backend Setup & Execution

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows:
   python -m venv .venv
   .venv\Scripts\activate

   # macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

The backend will start at `http://127.0.0.1:8000`. You can inspect the interactive OpenAPI Swagger documentation at `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup & Execution

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 10. Training Pipeline Execution

If you wish to collect new gestures or re-train the model:

```bash
cd backend

# 1. Collect custom gesture samples via webcam:
python training/collect_data.py --label HELLO --samples 100

# Or generate the benchmark dataset seed:
python training/collect_data.py --generate-benchmark

# 2. Train the MLP model:
python training/train_model.py --epochs 500 --lr 0.001

# 3. Evaluate model metrics on the held-out test split:
python training/evaluate_model.py

# 4. Verify model export compatibility:
python training/export_model.py
```

---

## 11. Testing & Validation

### Backend Tests (Pytest)
```bash
cd backend
pytest tests/ -v
```
Verifies health checks, model status schemas, invalid image handling, blank frame detection, landmark invariance, and temporal smoother behavior.

### Frontend Tests (Node.js Test Runner)
```bash
cd frontend
npm test
```
Verifies confidence classification, sentence builder manipulations (Add, Space, Backspace, Clear), camera error handlers, and speech synthesis fallbacks.

---

## 12. Important Scope Limitations

- **Defined Vocabulary**: The current system classifies a defined vocabulary of supported signs rather than an open-ended natural sign language dictionary.
- **Natural Sign Language Complexity**: Complete natural sign languages (such as Indian Sign Language or American Sign Language) incorporate intricate grammatical rules, continuous fluid transitions, spatial syntax, and non-manual signals (facial expressions and torso postures) that are not fully captured by hand landmarks alone.
- **Single-Hand Tracking**: The initial version is configured for single-hand gestures. Two-handed compound signs can be added by expanding the detector configuration to `max_num_hands=2` and updating feature dimensions to 126.

---

## 13. Future Improvements

1. **Sequential Dynamic Gesture Support**: Integrate an LSTM or Transformer temporal sequence model for continuous gestures (e.g. multi-word signing).
2. **Holistic Multimodal Capture**: Expand MediaPipe to include Face Mesh and Pose tracking to recognize facial grammar and body movement.
3. **Multilingual Speech Output**: Incorporate multi-language translation (e.g., translating recognized signs into Hindi, Tamil, Spanish, etc.).
4. **Offline Mobile App**: Package the model using TensorFlow Lite for native iOS and Android edge inference.

---

## 14. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
