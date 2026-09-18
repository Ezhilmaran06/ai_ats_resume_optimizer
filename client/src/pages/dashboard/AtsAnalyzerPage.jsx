import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  Sparkles,
  ArrowRight,
  Info,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AtsAnalyzerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(searchParams.get('resumeId') || '');
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchResumesAndJobs();
  }, []);

  const fetchResumesAndJobs = async () => {
    try {
      const [resRes, jobRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs')
      ]);
      if (resRes.data.success && resRes.data.data.length > 0) {
        setResumes(resRes.data.data);
        if (!selectedResumeId) setSelectedResumeId(resRes.data.data[0]._id);
      }
      if (jobRes.data.success && jobRes.data.data.length > 0) {
        setJobs(jobRes.data.data);
        if (!selectedJobId) setSelectedJobId(jobRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching data for ATS analyzer:', err);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      addToast('Please select a resume to analyze.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/ats/analyze', {
        resumeId: selectedResumeId,
        jobId: selectedJobId || undefined
      });

      if (res.data.success) {
        setReport(res.data.data);
        addToast(`ATS Compatibility Score calculated: ${res.data.data.overallScore}/100!`, 'success');
      }
    } catch (err) {
      addToast('Error running ATS analysis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when IDs are set
  useEffect(() => {
    if (selectedResumeId) {
      handleRunAnalysis();
    }
  }, [selectedResumeId, selectedJobId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ATS Compatibility Analyzer</h2>
            <span className="badge badge-info" style={{ gap: '4px' }}>
              <Gauge size={14} /> 7-Category Rubric
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-dimensional evaluation simulating candidate screening algorithms across enterprise ATS systems.
          </p>
        </div>

        <button onClick={handleRunAnalysis} disabled={loading || !selectedResumeId} className="btn btn-primary">
          <RotateCcw size={16} />
          <span>{loading ? 'Evaluating...' : 'Re-Run Diagnostic'}</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Select Resume</label>
          <select
            className="form-select"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
          >
            {resumes.map(r => (
              <option key={r._id} value={r._id}>
                {r.title} ({r.templateId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Compare Against Target Job (Optional)</label>
          <select
            className="form-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">General ATS Standards (No specific job)</option>
            {jobs.map(j => (
              <option key={j._id} value={j._id}>
                {j.role} — {j.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results View */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Score Gauge & Overview */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'center' }}>
            {/* Circular Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#E2E8F0"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={report.overallScore >= 80 ? '#10B981' : (report.overallScore >= 65 ? '#2563EB' : '#F59E0B')}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * report.overallScore) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {report.overallScore}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    / 100
                  </span>
                </div>
              </div>
              <span className="badge badge-success" style={{ marginTop: '12px' }}>
                {report.overallScore >= 80 ? 'High ATS Compatibility' : 'Moderate Compatibility'}
              </span>
            </div>

            {/* Rubric Breakdown Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Transparent Category Rubric</h3>

              {[
                { label: 'Keyword Relevance', val: report.categories?.keywordRelevance, max: 25 },
                { label: 'Technical Skills Match', val: report.categories?.skillsMatch, max: 20 },
                { label: 'Job Relevance Alignment', val: report.categories?.jobRelevance, max: 15 },
                { label: 'Standard Resume Structure', val: report.categories?.structure, max: 10 },
                { label: 'Section Completeness', val: report.categories?.sectionCompleteness, max: 10 },
                { label: 'Readability & Action Verbs', val: report.categories?.readability, max: 10 },
                { label: 'Formatting & Parseability', val: report.categories?.formatting, max: 10 }
              ].map(cat => (
                <div key={cat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{cat.label}</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{cat.val} / {cat.max}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(cat.val / cat.max) * 100}%`,
                        backgroundColor: (cat.val / cat.max) > 0.8 ? '#10B981' : ((cat.val / cat.max) > 0.6 ? '#2563EB' : '#F59E0B'),
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Warnings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Strengths */}
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#065F46', marginBottom: '12px' }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span>Verified ATS Strengths</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(report.strengths || []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings & Suggestions */}
            <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#92400E', marginBottom: '12px' }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <span>Critical Detection Warnings</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(report.warnings || []).map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <AlertTriangle size={15} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations with Fix Now Buttons */}
          {(report.fixRecommendations || []).length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Actionable Fix Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report.fixRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{rec.title}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{rec.description}</div>
                    </div>

                    <button
                      onClick={() => {
                        if (rec.actionType === 'NAVIGATE_OPTIMIZER') {
                          navigate(`/dashboard/optimizer?resumeId=${selectedResumeId}&jobId=${selectedJobId}`);
                        } else {
                          navigate(`/dashboard/builder/${selectedResumeId}`);
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Sparkles size={14} color="var(--primary)" />
                      <span>Fix Now</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Rubric Disclaimer */}
          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <Info size={14} style={{ display: 'inline', marginRight: '6px' }} />
            <strong>Disclaimer:</strong> {report.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
