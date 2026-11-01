import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function SentenceBuilder({
  currentSign,
  stableLabel,
  autoAddEnabled,
  onToggleAutoAdd
}) {
  const [sentence, setSentence] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const lastAddedSignRef = useRef(null);

  // Load browser speech synthesis voices
  const populateVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }
    const available = window.speechSynthesis.getVoices();
    if (available && available.length > 0) {
      setVoices(available);
      // Default to an English voice if available
      const defaultIdx = available.findIndex(v => v.lang.startsWith('en'));
      if (defaultIdx !== -1 && selectedVoiceIndex === 0) {
        setSelectedVoiceIndex(defaultIdx);
      }
    }
  }, [selectedVoiceIndex]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [populateVoices]);

  // Handle auto-add of stable predictions without repeated duplicates
  useEffect(() => {
    if (!autoAddEnabled || !stableLabel) return;

    const formatted = stableLabel.replace(/_/g, ' ');
    if (formatted !== lastAddedSignRef.current) {
      lastAddedSignRef.current = formatted;
      setSentence(prev => {
        const trimmed = prev.trim();
        return trimmed.length > 0 ? `${trimmed} ${formatted}` : formatted;
      });
    }
  }, [stableLabel, autoAddEnabled]);

  // Button actions
  const handleAddSign = (signToAdd = null) => {
    const target = signToAdd || currentSign;
    if (!target) return;
    const formatted = target.replace(/_/g, ' ');
    setSentence(prev => {
      const trimmed = prev.trim();
      return trimmed.length > 0 ? `${trimmed} ${formatted}` : formatted;
    });
  };

  const handleAddSpace = () => {
    setSentence(prev => prev + ' ');
  };

  const handleBackspace = () => {
    setSentence(prev => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return '';
      // Remove last word
      const lastSpace = trimmed.lastIndexOf(' ');
      return lastSpace === -1 ? '' : trimmed.substring(0, lastSpace).trim();
    });
  };

  const handleClear = () => {
    setSentence('');
    lastAddedSignRef.current = null;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (!sentence.trim()) return;
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    // Stop any in-flight utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sentence.trim());
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }
    utterance.rate = speechRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleCopy = () => {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="sentence-builder-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3 className="panel-title">Sentence Builder & Speech Translation</h3>
          <span className="panel-subtitle">Construct phrases from recognized gestures and convert to speech</span>
        </div>

        {/* Auto-Add Toggle */}
        <label className="auto-add-toggle">
          <input
            type="checkbox"
            checked={autoAddEnabled}
            onChange={(e) => onToggleAutoAdd(e.target.checked)}
          />
          <span className="toggle-text">Auto-append stable signs</span>
        </label>
      </div>

      {/* Editable Sentence Area */}
      <div className="sentence-input-wrapper">
        <textarea
          className="sentence-textarea"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Recognized signs will appear here. You can also edit, format, or type manually..."
          rows={3}
        />
        <div className="textarea-footer">
          <span className="word-count">
            {sentence.trim() ? sentence.trim().split(/\s+/).length : 0} words • {sentence.length} characters
          </span>
          {sentence && (
            <button className="btn-copy" onClick={handleCopy} title="Copy sentence to clipboard">
              {copyFeedback ? '✓ Copied' : '📋 Copy Text'}
            </button>
          )}
        </div>
      </div>

      {/* Primary Builder Action Buttons */}
      <div className="builder-buttons-grid">
        <button
          className="btn btn-outline"
          onClick={() => handleAddSign()}
          disabled={!currentSign}
          title="Append current predicted sign"
        >
          <span className="btn-icon">+</span> Add Sign
        </button>

        <button className="btn btn-outline" onClick={handleAddSpace} title="Insert space">
          Space
        </button>

        <button
          className="btn btn-outline"
          onClick={handleBackspace}
          disabled={!sentence}
          title="Delete last word"
        >
          ⌫ Backspace
        </button>

        <button
          className="btn btn-outline btn-outline-danger"
          onClick={handleClear}
          disabled={!sentence}
          title="Clear sentence"
        >
          Clear
        </button>

        <button
          className={`btn ${isSpeaking ? 'btn-danger' : 'btn-primary'} btn-speak`}
          onClick={isSpeaking ? handleStopSpeech : handleSpeak}
          disabled={!sentence.trim() || !speechSupported}
        >
          {isSpeaking ? (
            <>
              <span className="speak-pulse"></span> Stop Speech
            </>
          ) : (
            <>
              <span className="btn-icon">🔊</span> Speak Sentence
            </>
          )}
        </button>
      </div>

      {/* Voice & Speech Synthesis Settings */}
      {speechSupported && voices.length > 0 && (
        <div className="voice-controls-row">
          <div className="control-group">
            <label htmlFor="voice-select" className="control-label">Voice:</label>
            <select
              id="voice-select"
              className="select-input select-voice"
              value={selectedVoiceIndex}
              onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
            >
              {voices.map((v, i) => (
                <option key={i} value={i}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group speed-group">
            <label className="control-label">Speed: {speechRate}x</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="speed-slider"
            />
          </div>
        </div>
      )}

      {!speechSupported && (
        <div className="speech-unsupported-note">
          Speech synthesis is not supported on this browser.
        </div>
      )}
    </div>
  );
}
