import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="section about-section">
      <div className="section-header">
        <span className="section-pill">About the Project</span>
        <h2 className="section-title">Empowering Communication with Accessible AI</h2>
        <p className="section-subtitle">
          Bridging the communication barrier between sign language users and the wider community.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-card-icon">🎯</div>
          <h3>Project Objective</h3>
          <p>
            SignSpeak AI demonstrates real-time translation of hand gestures into readable text and synthesized speech. By leveraging computer vision and neural classification, it offers an intuitive assistant for non-verbal expression.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">🛡️</div>
          <h3>Privacy-First Architecture</h3>
          <p>
            Your webcam video never leaves your computer. Inference occurs locally through your FastAPI backend server. No personal imagery is stored, recorded, or transmitted to third-party cloud services.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">⚠️</div>
          <h3>Important Scope Limitation</h3>
          <p>
            This system classifies a <strong>defined vocabulary of supported signs</strong>. Full natural sign languages (such as ISL or ASL) possess complex grammar, non-manual facial cues, and spatial syntax which require advanced sequence modeling beyond static hand landmarks.
          </p>
        </div>
      </div>

      <div className="tech-stack-container">
        <h4 className="tech-stack-title">Technologies Used</h4>
        <div className="tech-pills">
          <span className="tech-pill">React 18 & Vite</span>
          <span className="tech-pill">FastAPI & Python 3.14</span>
          <span className="tech-pill">Google MediaPipe Hands</span>
          <span className="tech-pill">Scikit-learn MLP Neural Classifier</span>
          <span className="tech-pill">OpenCV Computer Vision</span>
          <span className="tech-pill">Web Speech API</span>
        </div>
      </div>
    </section>
  );
}

