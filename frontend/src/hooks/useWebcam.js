import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage webcam hardware access, frame capture, and camera device switching.
 *
 * Fix: OverconstrainedError was caused by using { exact: deviceId } which fails when the
 * deviceId is stale (enumerated before permission was granted, or from a previous session).
 * Now uses a 3-stage fallback: ideal constraints → no deviceId → bare video:true.
 */
export function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

  /**
   * Enumerate available video input devices.
   * Must be called AFTER permission is granted so labels and real IDs are returned.
   */
  const updateDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
      // Only pre-select if nothing is selected yet
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
    }
  }, [selectedDeviceId]);

  /**
   * Stop all active tracks and release camera resources.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  /**
   * Attach a MediaStream to the video element and wait for it to be ready.
   */
  const attachStream = useCallback(async (stream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // play() may throw if the element is not yet in the DOM — handle gracefully
      try {
        await videoRef.current.play();
      } catch (playErr) {
        console.warn('video.play() warning (usually safe to ignore):', playErr);
      }
    }
    setIsActive(true);
    setPermissionStatus('granted');
    // Enumerate devices AFTER permission — now real labels and IDs are available
    await updateDevices();
  }, [updateDevices]);

  /**
   * Try getUserMedia with the given constraints.
   * Returns the stream on success, throws on failure.
   */
  const tryGetUserMedia = useCallback(async (constraints) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser or context (requires HTTPS or localhost).');
    }
    return await navigator.mediaDevices.getUserMedia(constraints);
  }, []);

  /**
   * Start webcam with a 3-stage fallback:
   *   Stage 1 — Ideal constraints + preferred device ID (using `ideal`, NOT `exact`)
   *   Stage 2 — Ideal constraints, no device ID (let browser choose)
   *   Stage 3 — Bare { video: true } (maximum compatibility)
   *
   * ROOT CAUSE FIX: The original code used `{ exact: deviceIdToUse }` which throws
   * OverconstrainedError when the deviceId is stale or invalid. Using `{ ideal: ... }`
   * instead tells the browser to prefer that device but fall back automatically.
   */
  const startCamera = useCallback(async (preferredDeviceId = null) => {
    setError(null);
    stopCamera();

    // Resolve which device ID to try first
    const deviceIdToUse = preferredDeviceId || selectedDeviceId || null;

    // ── Stage 1: ideal resolution + preferred device (ideal, not exact) ──
    const stage1 = {
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24, max: 30 },
        ...(deviceIdToUse ? { deviceId: { ideal: deviceIdToUse } } : {})
      }
    };

    // ── Stage 2: ideal resolution, no device constraint ──
    const stage2 = {
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 }
      }
    };

    // ── Stage 3: bare video (maximum compatibility) ──
    const stage3 = { audio: false, video: true };

    const stages = [
      { label: 'stage1 (ideal constraints + device)', constraints: stage1 },
      { label: 'stage2 (ideal resolution, any device)', constraints: stage2 },
      { label: 'stage3 (bare video: true)', constraints: stage3 },
    ];

    let lastErr = null;
    for (const { label, constraints } of stages) {
      try {
        console.info(`[useWebcam] Attempting camera open: ${label}`);
        const stream = await tryGetUserMedia(constraints);
        await attachStream(stream);
        console.info(`[useWebcam] Camera opened successfully via ${label}`);
        return; // success — stop trying further stages
      } catch (err) {
        console.warn(`[useWebcam] ${label} failed:`, err.name, err.message);
        lastErr = err;

        // Permission errors: no point trying other constraints
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          break;
        }
        // Device not found: skip remaining stages too
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          break;
        }
      }
    }

    // All stages failed — show a user-friendly message
    setIsActive(false);
    const err = lastErr;
    if (!err) return;

    console.error('[useWebcam] All camera open attempts failed. Last error:', err);

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setPermissionStatus('denied');
      setError('Camera access is blocked. Allow camera permission in your browser settings and try again.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      setError('No webcam detected. Please connect a camera and try again.');
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      setError('Camera is in use by another application. Close other apps using the camera and try again.');
    } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
      setError('Your camera does not support the requested settings. Try restarting the browser.');
    } else if (err.message?.includes('getUserMedia is not supported')) {
      setError('Camera access requires a secure connection (HTTPS) or localhost.');
    } else {
      setError(`Camera error: ${err.message || 'Unknown error'}. Check browser permissions.`);
    }
  }, [selectedDeviceId, stopCamera, attachStream, tryGetUserMedia]);

  /**
   * Capture a single video frame as a base64 JPEG string.
   * Returns null if the camera is not ready.
   */
  const captureFrame = useCallback((maxWidth = 480) => {
    const video = videoRef.current;
    // readyState >= 2 (HAVE_CURRENT_DATA) means a frame is available
    if (!video || !streamRef.current || video.readyState < 2) return null;
    // Protect against zero-size frames
    if (!video.videoWidth || !video.videoHeight) return null;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;

    const aspect = video.videoWidth / video.videoHeight;
    const width = Math.min(maxWidth, video.videoWidth);
    const height = Math.round(width / aspect);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Mirror capture to match mirrored video preview
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // Release camera resources when the hook's owning component unmounts
  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    permissionStatus,
    error,
    startCamera,
    stopCamera,
    captureFrame
  };
}

