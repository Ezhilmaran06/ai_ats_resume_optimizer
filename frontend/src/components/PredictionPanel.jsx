import React from 'react';
import ConfidenceIndicator from './ConfidenceIndicator';

export default function PredictionPanel({
  prediction,
  rawPrediction,
  confidence,
  isConfident,
  stablePrediction,
  stableLabel,
  handDetected,
  probabilities,
  threshold,
  modelLoaded,
  isRecognizing,
  onAddSignToSentence
}) {
  const displaySign = prediction ? prediction.replace(/_/g, ' ') : null;

  return (
    <div className="prediction-panel-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3 className="panel-title">AI Gesture Recognition</h3>
          <span className="panel-subtitle">Deep learning inference on 21 hand landmarks</span>
        </div>

        {stablePrediction && stableLabel && (
          <span className="badge-stable-pulse">
            ★ Stable: {stableLabel.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Main Current Sign Display Card */}
      <div className="current-sign-hero">
        <span className="hero-caption">CURRENT SIGN</span>

        {!modelLoaded ? (
          <div className="sign-display sign-waiting">
            <span className="sign-text-muted">Model Not Loaded</span>
            <span className="sign-subtext">Train or place model in backend/models/</span>
          </div>
        ) : !isRecognizing ? (
          <div className="sign-display sign-idle">
            <span className="sign-text-muted">Recognition Paused</span>
            <span className="sign-subtext">Click "Start Recognition" to begin</span>
          </div>
        ) : !handDetected ? (
          <div className="sign-display sign-searching">
            <span className="sign-text-muted">Searching for Hand</span>
            <span className="sign-subtext">Hold your hand clearly in front of the camera</span>
          </div>
        ) : displaySign ? (
          <div className="sign-display sign-active">
            <span className="sign-text-highlight">{displaySign}</span>
            <button
              className="btn btn-sm btn-secondary sign-add-shortcut"
              onClick={() => onAddSignToSentence(displaySign)}
              title="Add current sign to sentence"
            >
              + Add to Sentence
            </button>
          </div>
        ) : (
          <div className="sign-display sign-low-conf">
            <span className="sign-text-low">Low Confidence</span>
            <span className="sign-subtext">
              Raw: {rawPrediction ? rawPrediction.replace(/_/g, ' ') : 'Unknown'} ({Math.round(confidence * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* Confidence Indicator */}
      <ConfidenceIndicator
        confidence={confidence}
        threshold={threshold}
        isConfident={isConfident}
      />

      {/* Probability Distribution by Class */}
      {probabilities && Object.keys(probabilities).length > 0 && (
        <div className="probabilities-section">
          <h4 className="probabilities-title">Gesture Probability Distribution</h4>
          <div className="probabilities-list">
            {Object.entries(probabilities)
              .sort((a, b) => b[1] - a[1])
              .map(([label, prob]) => {
                const percent = Math.round(prob * 100);
                const isTop = label === rawPrediction && handDetected;
                return (
                  <div key={label} className={`prob-item ${isTop ? 'prob-item-top' : ''}`}>
                    <div className="prob-label-row">
                      <span className="prob-label-name">{label.replace(/_/g, ' ')}</span>
                      <span className="prob-value">{percent}%</span>
                    </div>
                    <div className="prob-bar-track">
                      <div
                        className={`prob-bar-fill ${isTop ? 'fill-primary' : 'fill-muted'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
