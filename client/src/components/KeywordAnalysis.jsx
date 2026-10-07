import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, ShieldAlert, Tag, ShieldCheck } from 'lucide-react';

export default function KeywordAnalysis({ matchedKeywords, missingKeywords, recommendedKeywords }) {
  const matched = matchedKeywords || [];
  const missing = missingKeywords || [];
  const recommended = recommendedKeywords || [];

  return (
    <div className="card keyword-analysis-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="icon-badge">
            <Tag size={18} />
          </div>
          <div>
            <h2 className="card-title">Keyword Analysis</h2>
            <p className="card-subtitle">
              Comparison of job description requirements against verified resume content
            </p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Anti-fabrication policy banner */}
        <div className="anti-fabrication-banner">
          <div className="banner-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="banner-content">
            <h4 className="banner-title">Anti-Fabrication & Integrity Policy</h4>
            <p className="banner-text">
              Applicant Tracking Systems match keywords, but technical interviewers verify claims.
              <strong> Never add a skill you do not possess.</strong> Only incorporate missing keywords if you have genuine
              hands-on experience and can support them with concrete evidence in your projects or work history.
            </p>
          </div>
        </div>

        {/* 1. Keywords Already Found */}
        <div className="keyword-section">
          <div className="section-title-row">
            <div className="title-left">
              <CheckCircle2 size={18} className="text-success" />
              <h3 className="section-heading">Keywords Already Found in Resume</h3>
            </div>
            <span className="badge badge-success">{matched.length} Matched</span>
          </div>
          <p className="section-note">
            These required or preferred technologies were successfully detected in your resume:
          </p>

          {matched.length > 0 ? (
            <div className="keyword-chips-wrap">
              {matched.map((kw, idx) => (
                <div key={idx} className="keyword-chip chip-matched">
                  <CheckCircle2 size={14} />
                  <span>{kw}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No direct keyword matches identified from the target job description.</p>
            </div>
          )}
        </div>

        {/* 2. Important Missing Keywords */}
        <div className="keyword-section">
          <div className="section-title-row">
            <div className="title-left">
              <AlertTriangle size={18} className="text-warning" />
              <h3 className="section-heading">Important Missing Keywords</h3>
            </div>
            <span className="badge badge-warning">{missing.length} Missing</span>
          </div>
          <p className="section-note">
            Technologies specified in the job description that were not detected in your resume:
          </p>

          {missing.length > 0 ? (
            <div className="missing-keywords-list">
              {missing.map((item, idx) => (
                <div key={idx} className="missing-keyword-card">
                  <div className="missing-kw-header">
                    <div className="missing-kw-title-group">
                      <span className="missing-kw-name">{item.keyword}</span>
                      <span className={`badge ${item.importance === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.importance} PRIORITY
                      </span>
                      {item.risky && (
                        <span className="badge badge-subtle-risk" title="No background evidence detected in resume">
                          <ShieldAlert size={12} />
                          Verify Before Adding
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="missing-kw-reason">{item.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="success-state-small">
              <CheckCircle2 size={16} />
              <span>Great job! All prominent job description technologies were detected in your resume.</span>
            </div>
          )}
        </div>

        {/* 3. Recommended Keywords */}
        {recommended.length > 0 && (
          <div className="keyword-section">
            <div className="section-title-row">
              <div className="title-left">
                <Sparkles size={18} className="text-primary" />
                <h3 className="section-heading">Recommended Role Keywords</h3>
              </div>
              <span className="badge badge-info">{recommended.length} Suggestions</span>
            </div>
            <p className="section-note">
              Core technologies genuinely relevant to this role that could significantly boost your match score if truthful:
            </p>

            <div className="recommended-grid">
              {recommended.map((item, idx) => (
                <div key={idx} className="recommended-card">
                  <div className="rec-card-top">
                    <span className="rec-name">{item.keyword}</span>
                    <span className={`badge ${item.importance === 'HIGH' ? 'badge-danger' : 'badge-subtle'}`}>
                      {item.importance}
                    </span>
                  </div>
                  <p className="rec-reason">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
