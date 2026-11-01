import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage webcam hardware access, frame capture, and camera device switching.
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

  // Enumerate camera devices
  const updateDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
    }
  }, [selectedDeviceId]);

  // Stop camera stream & release tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  // Start webcam
  const startCamera = useCallback(async (preferredDeviceId = null) => {
    setError(null);
    stopCamera();

    const deviceIdToUse = preferredDeviceId || selectedDeviceId;

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 }
        },
        audio: false
      };

      if (deviceIdToUse) {
        constraints.video.deviceId = { exact: deviceIdToUse };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setPermissionStatus('granted');
      await updateDevices();
    } catch (err) {
      console.error('Camera initialization error:', err);
      setIsActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera detected on this system. Please connect a webcam.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is currently in use by another application or blocked.');
      } else {
        setError(`Failed to open camera: ${err.message || 'Unknown error'}`);
      }
    }
  }, [selectedDeviceId, stopCamera, updateDevices]);

  // Capture a frame as a base64 JPEG string
  const captureFrame = useCallback((maxWidth = 480) => {
    const video = videoRef.current;
    if (!video || !streamRef.current || video.readyState < 2) {
      return null;
    }

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;

    const aspect = video.videoWidth / (video.videoHeight || 1);
    const width = Math.min(maxWidth, video.videoWidth || maxWidth);
    const height = Math.round(width / aspect);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Mirror the capture horizontally to match webcam mirror preview
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
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

