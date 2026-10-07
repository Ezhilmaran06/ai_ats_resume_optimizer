import React from 'react';
import { RotateCcw, FileText, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import ATSScore from './ATSScore';
import KeywordAnalysis from './KeywordAnalysis';
import Suggestions from './Suggestions';

export default function AnalysisResult({ result, onReset }) {
  if (!result) return null;

  return (
    <div id="analysis-results-section" className="analysis-results-wrapper">
      {/* SECTION DIVIDER / HEADER */}
      <div className="results-header-banner">
        <div className="results-header-left">
          <div className="results-badge">
            <Sparkles size={16} />
            <span>AI ATS Analysis Complete</span>
          </div>
          <h2 className="results-main-title">Analysis Results & Optimization Report</h2>
          <p className="results-main-subtitle">
            Comprehensive diagnostic of your resume against the target job requirements
          </p>
        </div>

        <button
          type="button"
          id="top-reset-btn"
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          title="Reset and analyze another resume"
        >
          <RotateCcw size={14} />
          <span>Analyze Another Resume</span>
        </button>
      </div>

      {/* SUMMARY OVERVIEW CARDS */}
      <div className="summary-cards-row">
        <div className="card summary-card">
          <div className="summary-card-header">
            <FileText size={16} className="text-primary" />
            <span className="summary-card-label">Extracted Resume Profile</span>
          </div>
          <p className="summary-card-text">{result.resume_summary}</p>
        </div>

        <div className="card summary-card">
          <div className="summary-card-header">
            <Briefcase size={16} className="text-primary" />
            <span className="summary-card-label">Target Role Overview</span>
          </div>
          <p className="summary-card-text">{result.job_summary}</p>
        </div>
      </div>

      {/* 1. ATS COMPATIBILITY SCORE & BREAKDOWN */}
      <ATSScore
        score={result.ats_score}
        breakdown={result.score_breakdown}
        confidence={result.confidence}
      />

      {/* 2. KEYWORD ANALYSIS */}
      <KeywordAnalysis
        matchedKeywords={result.matched_keywords}
        missingKeywords={result.missing_keywords}
        recommendedKeywords={result.recommended_keywords}
      />

      {/* 3. SEMANTIC MATCHING, WHY LOSING POINTS, & RECOMMENDATIONS */}
      <Suggestions
        semanticMatches={result.semantic_matches}
        problems={result.problems}
        recommendations={result.recommendations}
      />

      {/* BOTTOM ACTION BAR */}
      <div className="results-bottom-actions">
        <button
          type="button"
          id="bottom-reset-btn"
          className="btn btn-primary btn-lg"
          onClick={onReset}
        >
          <RotateCcw size={18} />
          <span>Analyze Another Resume</span>
        </button>
        <p className="bottom-reset-hint">
          Click above to reset the form, upload a new resume, or test another job description.
        </p>
      </div>
    </div>
  );
}
