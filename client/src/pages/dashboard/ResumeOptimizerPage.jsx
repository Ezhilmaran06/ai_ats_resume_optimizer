import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  Edit2,
  FileText,
  Briefcase,
  Layers,
  ArrowDown
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ResumeOptimizerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(searchParams.get('resumeId') || '');
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');

  const [matchingData, setMatchingData] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationPlan, setOptimizationPlan] = useState(null);
  const [decisions, setDecisions] = useState({}); // { [suggestionId]: 'ACCEPTED' | 'REJECTED' | 'EDITED' }
  const [editedTexts, setEditedTexts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchResumesAndJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      runMatchingAnalysis();
    }
  }, [selectedResumeId, selectedJobId]);

  const fetchResumesAndJobs = async () => {
    try {
      const [resRes, jobRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs')
      ]);
      if (resRes.data.success) {
        setResumes(resRes.data.data);
        if (!selectedResumeId && resRes.data.data.length > 0) {
          setSelectedResumeId(resRes.data.data[0]._id);
        }
      }
      if (jobRes.data.success) {
        setJobs(jobRes.data.data);
        if (!selectedJobId && jobRes.data.data.length > 0) {
          setSelectedJobId(jobRes.data.data[0]._id);
        }
      }
    } catch (err) {
      addToast('Failed to load resumes or jobs.', 'error');
    }
  };

  const runMatchingAnalysis = async () => {
    if (!selectedJobId) return;
    try {
      const res = await api.post('/matching/analyze', {
        resumeId: selectedResumeId || undefined,
        jobId: selectedJobId
      });
      if (res.data.success) {
        setMatchingData(res.data.data);
      }
    } catch (err) {
      console.error('Matching analysis failed:', err);
    }
  };

  const handleGenerateOptimization = async () => {
    if (!selectedResumeId || !selectedJobId) {
      addToast('Please select both a resume and a target job.', 'warning');
      return;
    }

    try {
      setOptimizing(true);
      const res = await api.post('/matching/optimize', {
        resumeId: selectedResumeId,
        jobId: selectedJobId
      });
      if (res.data.success) {
        setOptimizationPlan(res.data.data);
        // Initialize decisions as ACCEPTED by default for supported changes
        const initDecisions = {};
        const initTexts = {};
        res.data.data.suggestions.forEach(s => {
          initDecisions[s.id] = s.status === 'SUPPORTED' ? 'ACCEPTED' : 'PENDING';
          initTexts[s.id] = s.suggested;
        });
        setDecisions(initDecisions);
        setEditedTexts(initTexts);
        addToast('Tailored suggestions generated! Review each proposed change below.', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Optimization failed.', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  const handleAcceptAll = () => {
    const updated = { ...decisions };
    optimizationPlan?.suggestions?.forEach(s => {
      if (s.status !== 'UNSUPPORTED') {
        updated[s.id] = 'ACCEPTED';
      }
    });
    setDecisions(updated);
    addToast('Accepted all supported recommendations.', 'success');
  };

  const handleRejectAll = () => {
    const updated = { ...decisions };
    optimizationPlan?.suggestions?.forEach(s => {
      updated[s.id] = 'REJECTED';
    });
    setDecisions(updated);
    addToast('Rejected all suggestions.', 'info');
  };

  const handleApplyChanges = async () => {
    const acceptedList = (optimizationPlan?.suggestions || [])
      .filter(s => decisions[s.id] === 'ACCEPTED')
      .map(s => ({
        ...s,
        suggested: editedTexts[s.id] || s.suggested
      }));

    if (acceptedList.length === 0) {
      addToast('No accepted suggestions to apply.', 'warning');
      return;
    }

    try {
      setApplying(true);
      const res = await api.post('/matching/apply-suggestions', {
        resumeId: selectedResumeId,
        acceptedSuggestions: acceptedList
      });

      if (res.data.success) {
        addToast(`Applied ${acceptedList.length} verified improvements to resume!`, 'success');
        navigate(`/dashboard/builder/${selectedResumeId}`);
      }
    } catch (err) {
      addToast('Failed to apply suggestions to resume.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>AI Resume Tailoring & Optimizer</h2>
            <span className="badge badge-success" style={{ gap: '4px' }}>
              <ShieldCheck size={14} /> Anti-Fabrication Engine
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Compare resume competencies against target job requirements, reorder verified skills, and sharpen achievement phrasing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedResumeId && (
            <Link to={`/dashboard/builder/${selectedResumeId}`} className="btn btn-secondary">
              <FileText size={16} />
              <span>Open in AI Resume Editor</span>
            </Link>
          )}
          <button
            onClick={handleGenerateOptimization}
            disabled={optimizing || !selectedResumeId || !selectedJobId}
            className="btn btn-primary"
          >
            <Sparkles size={16} />
            <span>{optimizing ? 'Analyzing & Tailoring...' : 'Optimize Resume for This Job'}</span>
          </button>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">1. Choose Resume to Tailor</label>
          <select
            className="form-select"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
          >
            {resumes.map(r => (
              <option key={r._id} value={r._id}>
                {r.title} ({r.templateId}) {r.targetCompany ? `• ${r.targetCompany}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">2. Target Job Posting</label>
          <select
            className="form-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map(j => (
              <option key={j._id} value={j._id}>
                {j.role} — {j.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matching Breakdown Cards */}
      {matchingData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Overall Match Score</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
              {matchingData.matchPercentage}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {matchingData.summary?.matchedCount} Matched • {matchingData.summary?.partialCount} Partial • {matchingData.summary?.missingCount} Missing
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Found Keywords (Verified)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {(matchingData.keywords?.found || []).slice(0, 5).map((k, i) => (
                <span key={i} className="badge badge-success" style={{ fontSize: '11.5px' }}>✓ {k.keyword}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Missing Keywords</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {(matchingData.keywords?.missing || []).slice(0, 5).map((k, i) => (
                <span key={i} className="badge badge-danger" style={{ fontSize: '11.5px' }}>✕ {k.keyword}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANTI-FABRICATION MISSING SKILLS ALERTS */}
      {optimizationPlan?.missingSkillsAlerts?.length > 0 && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
            <AlertTriangle size={18} />
            <span>Anti-Fabrication Engine Notice: Missing Requirements Not Injected</span>
          </div>
          <p style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
            The target job requires the following skills, but they do not exist in your verified profile. In accordance with ResumeAI ethical rules, they have <strong>NOT</strong> been fabricated into your resume:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {optimizationPlan.missingSkillsAlerts.map((alert, i) => (
              <span key={i} className="badge badge-warning" style={{ fontSize: '12px' }}>
                {alert.skill} ({alert.priority})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI SUGGESTIONS REVIEW LIST */}
      {optimizationPlan && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>AI Suggested Enhancements</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Review each proposed modification. Accept, reject, or edit phrasing before applying to your resume.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAcceptAll} className="btn btn-secondary btn-sm">
                Accept All Supported
              </button>
              <button onClick={handleRejectAll} className="btn btn-secondary btn-sm">
                Reject All
              </button>
              <button onClick={handleApplyChanges} disabled={applying} className="btn btn-primary">
                {applying ? 'Applying Changes...' : 'Apply Accepted Changes'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Suggestions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {optimizationPlan.suggestions.map((item) => {
              const currentDecision = decisions[item.id] || 'PENDING';
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${item.status === 'SUPPORTED' ? 'var(--success)' : 'var(--warning)'}`,
                    borderRadius: '8px',
                    backgroundColor: currentDecision === 'REJECTED' ? '#F8FAFC' : '#FFFFFF',
                    opacity: currentDecision === 'REJECTED' ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <span className={`badge ${item.status === 'SUPPORTED' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Decision Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setDecisions({ ...decisions, [item.id]: 'ACCEPTED' })}
                        className={`btn btn-sm ${currentDecision === 'ACCEPTED' ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => setDecisions({ ...decisions, [item.id]: 'REJECTED' })}
                        className={`btn btn-sm ${currentDecision === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => setEditingId(isEditing ? null : item.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit2 size={14} /> {isEditing ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  {/* Explainable AI Reason */}
                  <div style={{ fontSize: '12.5px', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '6px 10px', borderRadius: '4px' }}>
                    <strong>Why:</strong> {item.reason}
                  </div>

                  {/* Original vs Suggested */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        ORIGINAL
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {item.original || '(Empty / Not specified)'}
                      </div>
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#ECFDF5', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>
                        SUGGESTED ENHANCEMENT
                      </div>
                      {isEditing ? (
                        <textarea
                          className="form-textarea"
                          style={{ fontSize: '13px' }}
                          value={editedTexts[item.id] || ''}
                          onChange={(e) => setEditedTexts({ ...editedTexts, [item.id]: e.target.value })}
                        />
                      ) : (
                        <div style={{ fontSize: '13px', color: '#065F46', lineHeight: '1.5', fontWeight: 500 }}>
                          {editedTexts[item.id] || item.suggested}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
