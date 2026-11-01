import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import WebcamPanel from './components/WebcamPanel';
import PredictionPanel from './components/PredictionPanel';
import SentenceBuilder from './components/SentenceBuilder';
import SupportedSigns from './components/SupportedSigns';
import HowItWorks from './components/HowItWorks';
import AboutSection from './components/AboutSection';
import StatusMessage from './components/StatusMessage';
import { useWebcam } from './hooks/useWebcam';
import api from './services/api';
import './App.css';

export default function App() {
  const {
    videoRef,
    isActive,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame
  } = useWebcam();

  // Inference state
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [vocabulary, setVocabulary] = useState([]);
  const [appError, setAppError] = useState(null);

  // Prediction outputs
  const [prediction, setPrediction] = useState(null);
  const [rawPrediction, setRawPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0.0);
  const [isConfident, setIsConfident] = useState(false);
  const [stablePrediction, setStablePrediction] = useState(false);
  const [stableLabel, setStableLabel] = useState(null);
  const [probabilities, setProbabilities] = useState({});
  const [landmarks, setLandmarks] = useState([]);
  const [handDetected, setHandDetected] = useState(false);

  // UI preferences
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [autoAddEnabled, setAutoAddEnabled] = useState(false);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);

  // Loop control refs
  const isProcessingRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const intervalIdRef = useRef(null);

  // 1. Initial backend and model status polling
  const fetchStatus = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      setBackendHealth(health);

      if (health.status === 'ok') {
        const status = await api.getModelStatus();
        setModelStatus(status);

        const vocabRes = await api.getVocabulary();
        setVocabulary(vocabRes.vocabulary || []);
        setAppError(null);
      } else {
        setAppError('Backend server is not responding. Ensure FastAPI is running on port 8000.');
      }
    } catch (err) {
      setBackendHealth({ status: 'error', error: err.message });
      setAppError('Could not reach backend API at ' + import.meta.env.VITE_API_BASE_URL);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 8000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  // 2. Real-time inference frame loop (runs when camera active and recognizing)
  const processFrameStep = useCallback(async () => {
    if (!isActive || !isRecognizing || isProcessingRef.current) {
      return;
    }

    const frameB64 = captureFrame(480);
    if (!frameB64) return;

    isProcessingRef.current = true;
    const startTime = performance.now();

    try {
      const res = await api.recognizeFrame(frameB64);
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      // Track FPS
      frameCountRef.current += 1;
      const now = Date.now();
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      if (res.success) {
        setHandDetected(res.hand_detected);
        setPrediction(res.prediction);
        setRawPrediction(res.raw_prediction);
        setConfidence(res.confidence || 0.0);
        setIsConfident(res.is_confident || false);
        setStablePrediction(res.stable_prediction || false);
        setStableLabel(res.stable_label || null);
        setProbabilities(res.probabilities || {});
        setLandmarks(res.landmarks || []);
      } else {
        // Recognition returned non-fatal error
        setHandDetected(false);
        setPrediction(null);
        setConfidence(0.0);
        setIsConfident(false);
      }
    } catch (err) {
      console.warn('Inference frame error:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [isActive, isRecognizing, captureFrame]);

  // Interval loop for controlled ~10 FPS inference
  useEffect(() => {
    if (isActive && isRecognizing) {
      intervalIdRef.current = setInterval(processFrameStep, 100);
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      // Reset inference UI state
      setHandDetected(false);
      setPrediction(null);
      setConfidence(0.0);
      setIsConfident(false);
      setStablePrediction(false);
      setStableLabel(null);
      setLandmarks([]);
      setFps(0);
      setLatencyMs(0);
      api.resetSmoothing();
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [isActive, isRecognizing, processFrameStep]);

  // Handlers
  const handleStartRecognition = async () => {
    if (!isActive) {
      await startCamera();
    }
    setIsRecognizing(true);
  };

  const handleStopRecognition = () => {
    setIsRecognizing(false);
  };

  const handleToggleRecognizing = () => {
    if (isRecognizing) {
      handleStopRecognition();
    } else {
      handleStartRecognition();
    }
  };

  const handleStopCameraFull = () => {
    setIsRecognizing(false);
    stopCamera();
  };

  return (
    <div className="app-layout">
      <Navbar backendHealth={backendHealth} modelStatus={modelStatus} />

      <main className="main-content">
        {/* Banner if backend is offline */}
        {appError && (
          <div className="container banner-container">
            <StatusMessage
              type="error"
              title="Connection Error"
              message={appError}
              actionText="Retry Connection"
              onAction={fetchStatus}
            />
          </div>
        )}

        {/* Section A — Introduction */}
        <section id="home" className="hero-section">
          <div className="container hero-container">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              AI Computer Vision & Deep Learning
            </div>
            <h1 className="hero-title">
              Break Communication Barriers with AI
            </h1>
            <p className="hero-subtitle">
              Recognize supported sign language gestures in real time using MediaPipe hand keypoints and translate them into readable text and synthesized speech.
            </p>

            <div className="hero-actions">
              <a
                href="#workspace"
                className="btn btn-primary btn-lg"
                onClick={handleStartRecognition}
              >
                Start Recognition
              </a>
              <a href="#supported-signs" className="btn btn-outline btn-lg">
                Explore Supported Signs
              </a>
            </div>
          </div>
        </section>

        {/* Section B — Live Recognition Workspace */}
        <section id="workspace" className="section workspace-section">
          <div className="container">
            <div className="section-header">
              <span className="section-pill">Interactive Workspace</span>
              <h2 className="section-title">Live Recognition Studio</h2>
              <p className="section-subtitle">
                Align your hand with the camera to recognize signs, construct sentences, and speak them out loud.
              </p>
            </div>

            <div className="workspace-grid">
              {/* Left Column: Webcam Panel */}
              <div className="workspace-col-left">
                <WebcamPanel
                  videoRef={videoRef}
                  isActive={isActive}
                  isRecognizing={isRecognizing}
                  onStartCamera={startCamera}
                  onStopCamera={handleStopCameraFull}
                  onToggleRecognizing={handleToggleRecognizing}
                  devices={devices}
                  selectedDeviceId={selectedDeviceId}
                  onSelectDevice={(id) => {
                    setSelectedDeviceId(id);
                    if (isActive) startCamera(id);
                  }}
                  landmarks={landmarks}
                  handDetected={handDetected}
                  fps={fps}
                  latencyMs={latencyMs}
                  cameraError={cameraError}
                  showLandmarks={showLandmarks}
                  onToggleLandmarks={setShowLandmarks}
                />
              </div>

              {/* Right Column: Prediction & Sentence Panels */}
              <div className="workspace-col-right">
                <PredictionPanel
                  prediction={prediction}
                  rawPrediction={rawPrediction}
                  confidence={confidence}
                  isConfident={isConfident}
                  stablePrediction={stablePrediction}
                  stableLabel={stableLabel}
                  handDetected={handDetected}
                  probabilities={probabilities}
                  threshold={modelStatus?.confidence_threshold || 0.75}
                  modelLoaded={modelStatus?.model_loaded}
                  isRecognizing={isRecognizing}
                  onAddSignToSentence={(sign) => {
                    const el = document.querySelector('.sentence-textarea');
                    if (el) {
                      const cur = el.value.trim();
                      el.value = cur ? `${cur} ${sign}` : sign;
                      el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                />

                <SentenceBuilder
                  currentSign={isConfident ? prediction : null}
                  stableLabel={stableLabel}
                  autoAddEnabled={autoAddEnabled}
                  onToggleAutoAdd={setAutoAddEnabled}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section C — Supported Signs */}
        <div className="container">
          <SupportedSigns
            vocabulary={vocabulary}
            modelLoaded={modelStatus?.model_loaded}
          />
        </div>

        {/* Section D — How It Works */}
        <div className="container">
          <HowItWorks />
        </div>

        {/* Section E — About & Scope */}
        <div className="container">
          <AboutSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <strong>SignSpeak AI</strong> — Real-Time Sign Language Recognition & Speech Translation
          </div>
          <div className="footer-meta">
            Developed with React 18, FastAPI, MediaPipe, and Scikit-learn MLP • MIT License
          </div>
        </div>
      </footer>
    </div>
  );
}

