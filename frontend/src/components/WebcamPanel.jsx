import React, { useRef, useEffect } from 'react';

// Hand landmark bone connections for canvas drawing
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17]
];

export default function WebcamPanel({
  videoRef,
  isActive,
  isRecognizing,
  onStartCamera,
  onStopCamera,
  onToggleRecognizing,
  devices,
  selectedDeviceId,
  onSelectDevice,
  landmarks,
  handDetected,
  fps,
  latencyMs,
  cameraError,
  showLandmarks,
  onToggleLandmarks
}) {
  const canvasRef = useRef(null);

  // Draw landmarks on the overlay canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showLandmarks || !handDetected || !landmarks || landmarks.length !== 21) {
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Draw connection lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2563EB'; // Primary Blue
    HAND_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    // Draw landmark joint points
    landmarks.forEach((lm, idx) => {
      const x = lm.x * w;
      const y = lm.y * h;

      ctx.beginPath();
      ctx.arc(x, y, idx === 0 ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = idx === 0 ? '#DC2626' : (idx % 4 === 0 ? '#F59E0B' : '#10B981');
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [landmarks, handDetected, showLandmarks]);

  return (
    <div className="webcam-panel-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3 className="panel-title">Webcam Live Feed</h3>
          <span className="panel-subtitle">Captures hand gestures for real-time inference</span>
        </div>

        {/* Live Status indicator */}
        <div className="feed-status-badges">
          {isActive && (
            <span className={`feed-badge ${handDetected ? 'badge-hand-detected' : 'badge-hand-searching'}`}>
              <span className="feed-dot"></span>
              {handDetected ? 'Hand Detected' : 'Searching for Hand...'}
            </span>
          )}
          {isRecognizing && (
            <span className="feed-badge badge-active-infer">
              {fps} FPS {latencyMs > 0 && `• ${latencyMs}ms`}
            </span>
          )}
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="video-viewport">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              className="video-element"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="landmark-canvas"
              width={640}
              height={480}
            />
          </>
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                <rect x="2" y="6" width="14" height="12" rx="2"></rect>
              </svg>
            </div>
            <h4>Camera is Stopped</h4>
            <p>Click "Start Camera" to enable video capture and begin sign recognition.</p>
            <button className="btn btn-primary" onClick={onStartCamera}>
              Start Camera
            </button>
          </div>
        )}

        {/* Camera Error overlay */}
        {cameraError && (
          <div className="camera-error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* Camera Toolbar & Controls */}
      <div className="webcam-controls-bar">
        <div className="controls-left">
          {isActive ? (
            <button
              className={`btn ${isRecognizing ? 'btn-danger' : 'btn-success'}`}
              onClick={onToggleRecognizing}
            >
              {isRecognizing ? (
                <>
                  <span className="btn-icon">⏹</span> Stop Recognition
                </>
              ) : (
                <>
                  <span className="btn-icon">▶</span> Start Recognition
                </>
              )}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onStartCamera}>
              <span className="btn-icon">📷</span> Start Camera
            </button>
          )}

          {isActive && (
            <button className="btn btn-outline" onClick={onStopCamera}>
              Turn Off Camera
            </button>
          )}
        </div>

        <div className="controls-right">
          {devices && devices.length > 1 && (
            <div className="control-field">
              <label htmlFor="camera-select" className="control-label">Camera:</label>
              <select
                id="camera-select"
                className="select-input"
                value={selectedDeviceId}
                onChange={(e) => onSelectDevice(e.target.value)}
                disabled={!isActive}
              >
                {devices.map((device, i) => (
                  <option key={device.deviceId || i} value={device.deviceId}>
                    {device.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isActive && (
            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={showLandmarks}
                onChange={(e) => onToggleLandmarks(e.target.checked)}
              />
              <span>Show 21 Landmarks</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
