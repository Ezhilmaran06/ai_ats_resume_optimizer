import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Briefcase,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function InterviewPrepPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [loading, setLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [pitches, setPitches] = useState(null);

  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [selectedPitchDuration, setSelectedPitchDuration] = useState('60');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.data.success && res.data.data.length > 0) {
        setJobs(res.data.data);
        if (!selectedJobId) {
          setSelectedJobId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const generateInterviewPrep = async () => {
    if (!selectedJobId) return;
    try {
      setLoading(true);
      const [qRes, pRes] = await Promise.all([
        api.post('/interview/generate', { jobId: selectedJobId }),
        api.post('/interview/pitch', { jobId: selectedJobId })
      ]);

      if (qRes.data.success) {
        setInterviewData(qRes.data.data);
      }
      if (pRes.data.success) {
        setPitches(pRes.data.data);
      }
      addToast('Generated role-aligned interview questions & self-intro pitches!', 'success');
    } catch (err) {
      addToast('Error generating interview preparation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      generateInterviewPrep();
    }
  }, [selectedJobId]);

  const handleCopyPitch = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Copied elevator pitch to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Role-Specific Interview Preparation</h2>
            <span className="badge badge-info" style={{ gap: '4px' }}>
              <MessageSquare size={14} /> Grounded in Profile
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Technical and behavioral questions mapped to this employer's requirements and your verified project history.
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: 0, minWidth: '260px' }}>
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

      {/* 1. ELEVATOR PITCH SECTION */}
      {pitches && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>AI Self-Introduction Generator ("Tell Me About Yourself")</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Grounded entirely in your verified experience and tailored for the target company.
              </p>
            </div>

            {/* Duration Toggles */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-subtle)', padding: '3px', borderRadius: '6px' }}>
              {['30', '60', '90'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedPitchDuration(d)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedPitchDuration === d ? '#FFFFFF' : 'transparent',
                    color: selectedPitchDuration === d ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: selectedPitchDuration === d ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {d} Seconds
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            position: 'relative'
          }}>
            {selectedPitchDuration === '30' && pitches.pitch30}
            {selectedPitchDuration === '60' && pitches.pitch60}
            {selectedPitchDuration === '90' && pitches.pitch90}

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleCopyPitch(
                  selectedPitchDuration === '30' ? pitches.pitch30 : (selectedPitchDuration === '60' ? pitches.pitch60 : pitches.pitch90)
                )}
                className="btn btn-secondary btn-sm"
              >
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Pitch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUESTIONS & MODEL ANSWERS */}
      {interviewData && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
              Questions for {interviewData.role} at {interviewData.company}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Click any question to reveal sample star-method answer and recruiter coaching tips.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interviewData.questions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    style={{
                      padding: '14px 18px',
                      backgroundColor: isExpanded ? 'var(--bg-subtle)' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${q.category === 'Technical' ? 'badge-primary' : (q.category === 'Project' ? 'badge-info' : 'badge-neutral')}`}>
                        {q.category}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {q.question}
                      </span>
                    </div>

                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>
                          RECOMMENDED RESPONSE:
                        </div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                          {q.sampleAnswer}
                        </p>
                      </div>

                      <div style={{ padding: '10px 14px', backgroundColor: '#FFFBEB', borderRadius: '6px', border: '1px solid #FDE68A', fontSize: '12.5px', color: '#92400E', display: 'flex', gap: '8px' }}>
                        <Lightbulb size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div><strong>Interviewer Tip:</strong> {q.tips}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
