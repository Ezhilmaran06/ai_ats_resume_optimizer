import React from 'react';

export default function SupportedSigns({ vocabulary, modelLoaded }) {
  if (!modelLoaded || !vocabulary || vocabulary.length === 0) {
    return (
      <section id="supported-signs" className="section supported-signs-section">
        <div className="section-header">
          <span className="section-pill">Vocabulary</span>
          <h2 className="section-title">Supported Gesture Vocabulary</h2>
          <p className="section-subtitle">
            Gestures recognized by the active computer vision model.
          </p>
        </div>

        <div className="empty-vocab-card">
          <div className="empty-vocab-icon">👐</div>
          <h3>No trained gesture vocabulary is available yet.</h3>
          <p>
            The backend does not have an active trained model loaded. You can collect data and train a model using the commands below:
          </p>
          <div className="code-snippet-box">
            <code>python training/collect_data.py --generate-benchmark</code>
            <code>python training/train_model.py</code>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="supported-signs" className="section supported-signs-section">
      <div className="section-header">
        <span className="section-pill">Trained Vocabulary</span>
        <h2 className="section-title">Supported Sign Gestures</h2>
        <p className="section-subtitle">
          The AI model classifies the following <strong>{vocabulary.length} gestures</strong> in real time using MediaPipe hand keypoints:
        </p>
      </div>

      <div className="vocab-grid">
        {vocabulary.map((item) => (
          <div key={item.label} className="vocab-card">
            <div className="vocab-card-header">
              <span className="vocab-badge-supported">✓ Active Model</span>
              <span className="vocab-label-code">{item.label}</span>
            </div>
            <h3 className="vocab-name">{item.display_name}</h3>
            <p className="vocab-desc">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="vocab-footer-note">
        <p>
          Need to add more gestures? Use <code>python training/collect_data.py --label &lt;YOUR_SIGN&gt;</code> to record new samples and retrain the classifier.
        </p>
      </div>
    </section>
  );
}

