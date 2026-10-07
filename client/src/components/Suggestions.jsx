import React from 'react';
import {
  GitCompare,
  AlertOctagon,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileEdit,
  ArrowRight
} from 'lucide-react';

export default function Suggestions({ semanticMatches, problems, recommendations }) {
  const matches = semanticMatches || [];
  const issues = problems || [];
  const recs = recommendations || [];

  return (
    <div className="suggestions-container">
      {/* 1. SEMANTIC MATCHING SECTION */}
      <div className="card suggestions-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="icon-badge">
              <GitCompare size={18} />
            </div>
            <div>
              <h2 className="card-title">Semantic Matching</h2>
              <p className="card-subtitle">
                AI evaluation beyond literal spelling (recognizes equivalent technologies and partial matches)
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">
          {matches.length > 0 ? (
            <div className="semantic-table-wrapper">
              <table className="semantic-table">
                <thead>
                  <tr>
                    <th>Job Requirement</th>
                    <th>Resume Match</th>
                    <th>Match Status</th>
                    <th>Semantic Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((item, idx) => {
                    const isStrong = item.match_type === 'Strong Match';
                    const isPartial = item.match_type === 'Partial Match';
                    const badgeClass = isStrong
                      ? 'badge-success'
                      : isPartial
                      ? 'badge-warning'
                      : 'badge-danger';

                    return (
                      <tr key={idx}>
                        <td className="td-req">
                          <strong>{item.requirement}</strong>
                        </td>
                        <td className="td-match">
                          {item.resume_match !== 'Not found' ? (
                            <span className="code-pill">{item.resume_match}</span>
                          ) : (
                            <span className="text-muted italic">Not found</span>
                          )}
                        </td>
                        <td className="td-status">
                          <span className={`badge ${badgeClass}`}>
                            {isStrong && <CheckCircle2 size={12} />}
                            {isPartial && <AlertCircle size={12} />}
                            {item.match_type}
                          </span>
                        </td>
                        <td className="td-expl">{item.explanation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-text">No semantic match data available.</p>
          )}
        </div>
      </div>

      {/* 2. WHY YOUR RESUME IS LOSING POINTS */}
      <div className="card suggestions-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="icon-badge icon-badge-danger">
              <AlertOctagon size={18} />
            </div>
            <div>
              <h2 className="card-title">Why Your Resume Is Losing Points</h2>
              <p className="card-subtitle">
                Specific issues identified from your resume and target job requirements
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">
          {issues.length > 0 ? (
            <div className="problems-list">
              {issues.map((prob, idx) => (
                <div key={idx} className="problem-item-card">
                  <div className="problem-item-header">
                    <span className="problem-number">{idx + 1}</span>
                    <div className="problem-title-group">
                      <h4 className="problem-title">{prob.title}</h4>
                      <span className={`badge ${prob.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                        {prob.severity} IMPACT
                      </span>
                    </div>
                  </div>
                  <p className="problem-description">{prob.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="success-state-small">
              <CheckCircle2 size={16} />
              <span>No critical structural or content issues identified!</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. RECOMMENDED IMPROVEMENTS */}
      <div className="card suggestions-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="icon-badge icon-badge-primary">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="card-title">Recommended Improvements</h2>
              <p className="card-subtitle">
                Prioritized action steps to maximize ATS scoring and interview shortlisting
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">
          {recs.length > 0 ? (
            <div className="recommendations-list">
              {recs.map((rec, idx) => (
                <div key={idx} className="rec-full-card">
                  <div className="rec-top-row">
                    <span className="priority-pill">{rec.priority}</span>
                    <h3 className="rec-title">{rec.title}</h3>
                  </div>

                  <div className="rec-body-block">
                    <div className="rec-why-row">
                      <span className="rec-label">Why It Matters:</span>
                      <p className="rec-text">{rec.reason}</p>
                    </div>

                    <div className="rec-how-row">
                      <span className="rec-label">How to Improve:</span>
                      <p className="rec-text">{rec.suggestion}</p>
                    </div>
                  </div>

                  {rec.suggested_rewrite && (
                    <div className="suggested-rewrite-box">
                      <div className="rewrite-header">
                        <FileEdit size={14} />
                        <span className="rewrite-tag">{rec.suggested_rewrite.label || 'Suggested Rewrite'}</span>
                        <span className="rewrite-section-pill">{rec.suggested_rewrite.section}</span>
                      </div>

                      <div className="rewrite-content">
                        <div className="rewrite-current">
                          <span className="rewrite-state-lbl">Current phrasing:</span>
                          <blockquote className="rewrite-quote current-quote">
                            "{rec.suggested_rewrite.current}"
                          </blockquote>
                        </div>

                        <div className="rewrite-arrow">
                          <ArrowRight size={16} />
                        </div>

                        <div className="rewrite-suggested">
                          <span className="rewrite-state-lbl suggested-lbl">Suggested ATS-optimized phrasing:</span>
                          <blockquote className="rewrite-quote suggested-quote">
                            "{rec.suggested_rewrite.suggested}"
                          </blockquote>
                        </div>
                      </div>

                      <p className="rewrite-disclaimer">
                        * Note: This rewrite uses only technologies verified in your resume. Never fabricate unworked experience.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No improvement suggestions available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
