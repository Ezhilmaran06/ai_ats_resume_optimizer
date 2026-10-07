import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileSearch,
  Check
} from 'lucide-react';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionInput from './components/JobDescriptionInput';
import AnalysisResult from './components/AnalysisResult';
import { analyzeResume } from './services/api';
import './App.css';

const ANALYSIS_STEPS = [
  'Extracting resume content',
  'Understanding job requirements',
  'Matching skills and keywords',
  'Calculating ATS compatibility',
  'Generating recommendations'
];

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const resultsRef = useRef(null);
  const stepTimerRef = useRef(null);

  // Cycle through real-looking analysis progress steps while loading
  useEffect(() => {
    if (loading) {
      setCurrentStepIndex(0);
      stepTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < ANALYSIS_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [loading]);

  const handleFileChange = (file, error) => {
    setResumeFile(file);
    setFileError(error);
    if (apiError) setApiError(null);
  };

  const handleJobDescriptionChange = (text) => {
    setJobDescription(text);
    if (apiError) setApiError(null);
  };

  const isFormValid = Boolean(resumeFile && jobDescription.trim().length >= 30);

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setFileError('Please upload your resume to begin analysis.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      setApiError('Please paste a complete job description with at least 30 characters.');
      return;
    }

    setLoading(true);
    setApiError(null);
    setAnalysisResult(null);

    try {
      const data = await analyzeResume(resumeFile, jobDescription.trim());
      setAnalysisResult(data);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Unable to analyze resume. Please ensure the backend service is running and try again.';
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setFileError(null);
    setJobDescription('');
    setApiError(null);
    setAnalysisResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* 1. PROFESSIONAL HEADER */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-group">
            <div className="logo-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="logo-text">AI ATS Resume Optimizer</h1>
              <p className="logo-tagline">Analyze your resume against any job description using AI.</p>
            </div>
          </div>
          <div className="header-meta">
            <span className="badge badge-subtle">
              <Sparkles size={13} />
              Deterministic & Anti-Fabrication Engine
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION */}
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI-Powered ATS Diagnostic</span>
          </div>
          <h2 className="hero-title">Is Your Resume ATS-Ready?</h2>
          <p className="hero-subtitle">
            Upload your resume and paste the job description to discover your ATS score, missing keywords, and the improvements that can increase your chances of getting shortlisted.
          </p>
        </section>

        {/* 3. TWO-COLUMN INPUT SECTION */}
        <section className="input-grid-section">
          <div className="input-grid">
            {/* Left: Resume Upload */}
            <ResumeUpload
              file={resumeFile}
              onFileChange={handleFileChange}
              error={fileError}
              disabled={loading}
            />

            {/* Right: Job Description */}
            <JobDescriptionInput
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              disabled={loading}
            />
          </div>

          {/* Error Banner */}
          {apiError && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} className="error-icon" />
              <div className="error-content">
                <strong>Analysis Failed:</strong> {apiError}
              </div>
            </div>
          )}

          {/* 4. ANALYZE BUTTON & PROGRESS */}
          <div className="action-row">
            {!loading ? (
              <div className="analyze-btn-wrap">
                <button
                  type="button"
                  id="analyze-resume-btn"
                  className="btn btn-primary btn-xl"
                  onClick={handleAnalyze}
                  disabled={!isFormValid || loading}
                >
                  <Sparkles size={20} />
                  <span>Analyze Resume</span>
                  <ArrowRight size={18} />
                </button>
                {!isFormValid && (
                  <p className="btn-helper-hint">
                    {!resumeFile && !jobDescription.trim()
                      ? 'Upload your resume and paste a job description to activate analysis.'
                      : !resumeFile
                      ? 'Please upload your resume file to proceed.'
                      : 'Please paste a job description (at least 30 characters) to proceed.'}
                  </p>
                )}
              </div>
            ) : (
              <div className="analysis-progress-card">
                <div className="progress-header">
                  <Loader2 size={24} className="spinner" />
                  <div>
                    <h3 className="progress-title">Analyzing Resume...</h3>
                    <p className="progress-sub">Running deep ATS semantic parsing and keyword evaluation</p>
                  </div>
                </div>

                <div className="progress-steps-list">
                  {ANALYSIS_STEPS.map((step, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`progress-step-item ${
                          isDone ? 'step-done' : isCurrent ? 'step-current' : 'step-pending'
                        }`}
                      >
                        <span className="step-status-icon">
                          {isDone ? (
                            <Check size={14} className="text-success" />
                          ) : isCurrent ? (
                            <span className="step-pulse" />
                          ) : (
                            <span className="step-dot" />
                          )}
                        </span>
                        <span className="step-name">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5. ANALYSIS RESULTS SECTION (Rendered on same landing page below form) */}
        <div ref={resultsRef}>
          {analysisResult && (
            <AnalysisResult
              result={analysisResult}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* 6. CLEAN MINIMAL FOOTER */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} AI ATS Resume Optimizer. Built for candidates, recruiters, and engineering teams.</p>
          <div className="footer-links">
            <span>Deterministic Scoring</span>
            <span>•</span>
            <span>No Fabrication</span>
            <span>•</span>
            <span>Single Page Workflow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
