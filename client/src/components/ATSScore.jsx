import React from 'react';
import { Gauge, Info, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 85) return '#10B981'; // Green
  if (score >= 70) return '#2563EB'; // Blue
  if (score >= 55) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
}

function getScoreBand(score) {
  if (score >= 95) return { label: 'Exceptional ATS Optimization', badge: 'badge-success' };
  if (score >= 85) return { label: 'Strong Competitive Alignment', badge: 'badge-success' };
  if (score >= 70) return { label: 'Strong ATS Compatibility', badge: 'badge-info' };
  if (score >= 55) return { label: 'Moderate ATS Compatibility', badge: 'badge-warning' };
  if (score >= 40) return { label: 'Below Industry Standards', badge: 'badge-warning' };
  return { label: 'Critical Rework Required', badge: 'badge-danger' };
}

export default function ATSScore({ score, breakdown, confidence }) {
  const scoreColor = getScoreColor(score);
  const band = getScoreBand(score);

  // SVG Circular calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const dimensions = [
    {
      id: 'ats_readability',
      label: 'ATS Readability',
      score: breakdown?.ats_readability ?? 0,
      max: 15,
      description: 'Text extractability, ASCII encoding, contact parsing',
    },
    {
      id: 'structure',
      label: 'Resume Structure',
      score: breakdown?.structure ?? 0,
      max: 15,
      description: 'Logical hierarchy, standard section headers, clean flow',
    },
    {
      id: 'keyword_coverage',
      label: 'Keyword Coverage',
      score: breakdown?.keyword_coverage ?? 0,
      max: 20,
      description: 'Required & preferred job description keyword coverage',
    },
    {
      id: 'skills_match',
      label: 'Skills Match',
      score: breakdown?.skills_match ?? 0,
      max: 15,
      description: 'Semantic matching across core technical competencies',
    },
    {
      id: 'experience_relevance',
      label: 'Experience Relevance',
      score: breakdown?.experience_relevance ?? 0,
      max: 10,
      description: 'Work history depth, role alignment, and accomplishments',
    },
    {
      id: 'project_relevance',
      label: 'Project Relevance',
      score: breakdown?.project_relevance ?? 0,
      max: 10,
      description: 'Technical project depth and hands-on technology proof',
    },
    {
      id: 'job_alignment',
      label: 'Job Alignment',
      score: breakdown?.job_alignment ?? 0,
      max: 10,
      description: 'Responsibilities overlap, qualification and degree fit',
    },
    {
      id: 'professional_language',
      label: 'Professional Language',
      score: breakdown?.professional_language ?? 0,
      max: 5,
      description: 'Power action verbs, absence of passive voice or pronouns',
    },
  ];

  return (
    <div className="card ats-score-card">
      <div className="ats-score-hero">
        <div className="ats-score-left">
          <div className="score-badge-wrap">
            <span className="ats-title-tag">
              <ShieldCheck size={16} />
              AI ATS COMPATIBILITY SCORE
            </span>
            <span className={`badge ${band.badge}`}>{band.label}</span>
          </div>

          <div className="score-number-row">
            <span className="score-main-number" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="score-max-number">/ 100</span>
          </div>

          <p className="score-disclaimer">
            <Info size={14} className="disclaimer-icon" />
            <span>
              This AI ATS Compatibility Score calculates structural readability, keyword coverage, and semantic alignment.
              Different ATS platforms (Workday, Greenhouse, Lever, Taleo) configure scoring weights differently.
            </span>
          </p>

          {confidence && (
            <div className="confidence-pill">
              <CheckCircle2 size={13} />
              <span>Analysis Confidence: {confidence}% (High Text Extractability)</span>
            </div>
          )}
        </div>

        <div className="ats-score-right">
          <div className="circular-meter-wrap">
            <svg className="circular-meter-svg" width="160" height="160" viewBox="0 0 160 160">
              <circle
                className="circular-meter-bg"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="12"
              />
              <circle
                className="circular-meter-progress"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="12"
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="circular-meter-center">
              <span className="meter-val" style={{ color: scoreColor }}>{score}%</span>
              <span className="meter-lbl">Match</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ats-breakdown-section">
        <h3 className="breakdown-title">
          <Gauge size={18} />
          Score Breakdown
        </h3>
        <p className="breakdown-subtitle">
          Transparent multi-dimensional evaluation based on standard enterprise ATS algorithms:
        </p>

        <div className="breakdown-grid">
          {dimensions.map((dim) => {
            const pct = Math.round((dim.score / dim.max) * 100);
            return (
              <div key={dim.id} className="breakdown-item">
                <div className="breakdown-item-header">
                  <div>
                    <span className="breakdown-name">{dim.label}</span>
                    <p className="breakdown-desc">{dim.description}</p>
                  </div>
                  <div className="breakdown-values">
                    <span className="breakdown-score-fraction">
                      <strong>{dim.score}</strong> / {dim.max}
                    </span>
                  </div>
                </div>

                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 80 ? '#10B981' : pct >= 50 ? '#2563EB' : '#F59E0B'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
