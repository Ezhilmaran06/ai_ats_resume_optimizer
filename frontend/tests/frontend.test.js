import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Confidence categorization logic
test('Confidence threshold classification', () => {
  const getConfidenceLevel = (confidence, threshold = 0.75) => {
    const isConfident = confidence >= threshold;
    const percentage = Math.round(confidence * 100);
    let level = 'low';
    if (percentage >= 80) level = 'high';
    else if (percentage >= 60) level = 'medium';
    return { isConfident, percentage, level };
  };

  const high = getConfidenceLevel(0.94, 0.75);
  assert.equal(high.isConfident, true);
  assert.equal(high.level, 'high');
  assert.equal(high.percentage, 94);

  const below = getConfidenceLevel(0.65, 0.75);
  assert.equal(below.isConfident, false);
  assert.equal(below.level, 'medium');

  const low = getConfidenceLevel(0.35, 0.75);
  assert.equal(low.isConfident, false);
  assert.equal(low.level, 'low');
});

// Test 2: Sentence Builder text manipulation
test('Sentence builder operations: Add, Space, Backspace, Clear', () => {
  let sentence = '';

  // Add Sign
  const addSign = (prev, sign) => {
    const trimmed = prev.trim();
    return trimmed.length > 0 ? `${trimmed} ${sign}` : sign;
  };

  sentence = addSign(sentence, 'HELLO');
  assert.equal(sentence, 'HELLO');

  sentence = addSign(sentence, 'PLEASE');
  assert.equal(sentence, 'HELLO PLEASE');

  sentence = addSign(sentence, 'HELP');
  assert.equal(sentence, 'HELLO PLEASE HELP');

  // Backspace (removes last word)
  const backspace = (prev) => {
    const trimmed = prev.trimEnd();
    if (!trimmed) return '';
    const lastSpace = trimmed.lastIndexOf(' ');
    return lastSpace === -1 ? '' : trimmed.substring(0, lastSpace).trim();
  };

  sentence = backspace(sentence);
  assert.equal(sentence, 'HELLO PLEASE');

  sentence = backspace(sentence);
  assert.equal(sentence, 'HELLO');

  sentence = backspace(sentence);
  assert.equal(sentence, '');

  // Clear
  sentence = 'SOME TEXT';
  sentence = '';
  assert.equal(sentence, '');
});

// Test 3: Prediction smoothing buffer simulation
test('Frontend temporal smoothing logic', () => {
  class ClientSmoother {
    constructor(windowSize = 3) {
      this.windowSize = windowSize;
      this.buffer = [];
    }

    add(label) {
      if (!label) {
        this.buffer = [];
        return { isStable: false, label: null };
      }
      this.buffer.push(label);
      if (this.buffer.length > this.windowSize) {
        this.buffer.shift();
      }
      const isStable = this.buffer.length === this.windowSize && this.buffer.every(l => l === label);
      return { isStable, label: isStable ? label : null };
    }
  }

  const smoother = new ClientSmoother(3);

  assert.equal(smoother.add('HELLO').isStable, false);
  assert.equal(smoother.add('HELLO').isStable, false);
  // 3 consecutive -> stable!
  assert.equal(smoother.add('HELLO').isStable, true);

  // Transient glitch resets stability
  assert.equal(smoother.add('NO').isStable, false);
});

// Test 4: Camera error mappings
test('Webcam error mapping returns human-readable instructions', () => {
  const getCameraErrorMessage = (errorName) => {
    switch (errorName) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera permission was denied. Please allow camera access in your browser settings.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera detected on this system. Please connect a webcam.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Camera is currently in use by another application or blocked.';
      default:
        return 'Failed to open camera.';
    }
  };

  assert.match(getCameraErrorMessage('NotAllowedError'), /permission was denied/i);
  assert.match(getCameraErrorMessage('NotFoundError'), /No camera detected/i);
  assert.match(getCameraErrorMessage('NotReadableError'), /currently in use/i);
});

// Test 5: Speech synthesis API fallback handling
test('Speech synthesis error handling when API is unavailable', () => {
  const speakText = (text, synthAvailable = false) => {
    if (!text || !text.trim()) {
      return { success: false, reason: 'empty_text' };
    }
    if (!synthAvailable) {
      return { success: false, reason: 'speech_api_unsupported' };
    }
    return { success: true, reason: 'speaking' };
  };

  assert.equal(speakText('', true).reason, 'empty_text');
  assert.equal(speakText('Hello', false).reason, 'speech_api_unsupported');
  assert.equal(speakText('Hello', true).reason, 'speaking');
});

// Test 6: API payload serialization
test('API recognize frame payload format', () => {
  const formatPayload = (base64Image, threshold = null) => {
    if (!base64Image) throw new Error('Image required');
    const payload = { image: base64Image };
    if (threshold !== null) payload.confidence_threshold = threshold;
    return payload;
  };

  const payload = formatPayload('data:image/jpeg;base64,abc123', 0.8);
  assert.equal(payload.image, 'data:image/jpeg;base64,abc123');
  assert.equal(payload.confidence_threshold, 0.8);
});
