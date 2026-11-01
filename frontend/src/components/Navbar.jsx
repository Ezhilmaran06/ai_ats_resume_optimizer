import React from 'react';

export default function Navbar({ backendHealth, modelStatus }) {
  const isBackendOnline = backendHealth && backendHealth.status === 'ok';
  const isModelLoaded = modelStatus && modelStatus.model_loaded;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">SignSpeak AI</span>
            <span className="brand-subtitle">Real-Time Sign Language Recognition & Speech</span>
          </div>
        </a>

        <nav className="navbar-links">
          <a href="#workspace" className="nav-link">Workspace</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#supported-signs" className="nav-link">Supported Signs</a>
          <a href="#about" className="nav-link">About</a>
        </nav>

        <div className="navbar-status">
          <div className={`status-pill ${isBackendOnline ? 'status-online' : 'status-offline'}`}>
            <span className="status-dot"></span>
            <span className="status-label">
              {!isBackendOnline ? 'Backend Offline' : isModelLoaded ? 'AI Model Ready' : 'Model Not Loaded'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

