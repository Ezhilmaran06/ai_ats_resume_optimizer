import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Real-Time Webcam Capture',
      description: 'The browser accesses your webcam via HTML5 getUserMedia and captures frames at an optimized rate, avoiding bandwidth saturation.'
    },
    {
      number: '02',
      title: 'MediaPipe 21 3D Hand Landmarks',
      description: 'MediaPipe detects hands and extracts 21 3D spatial keypoints per frame (wrist, MCP, PIP, DIP, and fingertips).'
    },
    {
      number: '03',
      title: 'Invariant Normalization & MLP',
      description: 'Coordinates are translation-normalized to the wrist and scale-normalized, producing a 63-dimensional feature vector fed to a trained MLP neural classifier.'
    },
    {
      number: '04',
      title: 'Smoothing & Speech Translation',
      description: 'A temporal sliding window filters noise before emitting stable signs. You can assemble sentences and convert them to spoken audio instantly.'
    }
  ];

  return (
    <section id="how-it-works" className="section how-it-works-section">
      <div className="section-header">
        <span className="section-pill">Architecture</span>
        <h2 className="section-title">How SignSpeak AI Works</h2>
        <p className="section-subtitle">
          An end-to-end pipeline bridging computer vision and natural speech synthesis.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <div key={step.number} className="step-card">
            <div className="step-number">{step.number}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
