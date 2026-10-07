import React from 'react';
import { Briefcase, RotateCcw, AlertCircle } from 'lucide-react';

export default function JobDescriptionInput({ value, onChange, disabled }) {
  const charCount = value ? value.length : 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const isTooShort = charCount > 0 && charCount < 30;

  const handleClear = () => {
    if (!disabled) {
      onChange('');
    }
  };

  return (
    <div className="card input-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="icon-badge">
            <Briefcase size={18} />
          </div>
          <div>
            <h2 className="card-title">Job Description</h2>
            <p className="card-subtitle">Paste responsibilities, required skills, qualifications, and tech stack</p>
          </div>
        </div>

        {charCount > 0 && (
          <button
            type="button"
            id="clear-jd-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleClear}
            disabled={disabled}
            title="Clear job description"
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="textarea-container">
          <textarea
            id="job-description-textarea"
            className={`jd-textarea ${isTooShort ? 'textarea-warning' : ''}`}
            placeholder="Paste the job description here... (Include responsibilities, required technologies, preferred skills, and experience qualifications)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={8}
            aria-label="Target Job Description"
          />
        </div>

        <div className="textarea-footer">
          <div className="textarea-counts">
            <span className="count-pill">{charCount} characters</span>
            <span className="count-pill">{wordCount} words</span>
            {isTooShort && (
              <span className="count-warning">
                <AlertCircle size={13} />
                At least 30 characters recommended
              </span>
            )}
          </div>
          <span className="textarea-hint">
            The more complete the job description, the more accurate your ATS match analysis will be.
          </span>
        </div>
      </div>
    </div>
  );
}
