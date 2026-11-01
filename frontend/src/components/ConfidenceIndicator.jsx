import React from 'react';

export default function ConfidenceIndicator({ confidence = 0, threshold = 0.75, isConfident = false }) {
  const percentage = Math.round(confidence * 100);
  const thresholdPercentage = Math.round(threshold * 100);

  let barColorClass = 'bar-low';
  if (percentage >= 80) {
    barColorClass = 'bar-high';
  } else if (percentage >= 60) {
    barColorClass = 'bar-medium';
  }

  return (
    <div className="confidence-indicator-card">
      <div className="confidence-header">
        <span className="confidence-label">Prediction Confidence</span>
        <span className={`confidence-badge ${isConfident ? 'badge-confident' : 'badge-low'}`}>
          {percentage}%
        </span>
      </div>

      <div className="confidence-bar-track">
        <div
          className={`confidence-bar-fill ${barColorClass}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
        {/* Threshold marker line */}
        <div
          className="confidence-threshold-marker"
          style={{ left: `${thresholdPercentage}%` }}
          title={`Min Threshold: ${thresholdPercentage}%`}
        />
      </div>

      <div className="confidence-footer">
        <span className="threshold-caption">Threshold: {thresholdPercentage}%</span>
        <span className="threshold-status">
          {isConfident ? '✓ Confident' : '⚠ Below Threshold'}
        </span>
      </div>
    </div>
  );
}

