import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Code2,
  Clock,
  Sparkles,
  Layers,
  ArrowLeftRight,
  Check,
  X,
  FileText,
  Briefcase
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SkillGapPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [selectedResumeId, setSelectedResumeId] = useState(searchParams.get('resumeId') || '');
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL'); // 'ALL' | 'MATCHED' | 'PARTIAL' | 'MISSING'

  useEffect(() => {
    fetchResumesAndJobs();
  }, []);

  const fetchResumesAndJobs = async () => {
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/resumes')
      ]);

      if (jobsRes.data.success && jobsRes.data.data.length > 0) {
        setJobs(jobsRes.data.data);
        if (!selectedJobId) {
          setSelectedJobId(jobsRes.data.data[0]._id);
        }
      }

      if (resumesRes.data.success && resumesRes.data.data.length > 0) {
        setResumes(resumesRes.data.data);
        if (!selectedResumeId) {
          setSelectedResumeId(resumesRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs or resumes:', err);
    }
  };

  const handleFetchAnalysis = async () => {
    if (!selectedJobId) return;
    try {
      setLoading(true);
      const res = await api.post('/skills/gap-roadmap', {
        jobId: selectedJobId,
        resumeId: selectedResumeId || undefined
      });
      if (res.data.success) {
        setGapData(res.data.data);
      }
    } catch (err) {
      addToast('Error calculating skill gap and keyword analysis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      handleFetchAnalysis();
    }
  }, [selectedJobId, selectedResumeId]);

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  // Grouped items
  const matchedList = gapData?.matched || [];
  const partialList = gapData?.partial || [];
  const missingList = gapData?.missing || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Skill & Keyword Analysis
            </h2>
            <span className="badge badge-success" style={{ gap: '4px' }}>
              <ShieldCheck size={14} /> Strict Candidate Integrity
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Compares your verified background directly against employer requirements. Identifies matched, partial, and missing skills with actionable learning recommendations.
          </p>
        </div>

        {/* Target Job & Resume Selectors */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Resume Source:
            </label>
            <select
              className="form-select"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              style={{ fontSize: '12.5px', minWidth: '180px' }}
            >
              <option value="">Master Profile</option>
              {resumes.map(r => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Target Job Role:
            </label>
            <select
              className="form-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{ fontSize: '12.5px', minWidth: '220px' }}
            >
              {jobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.role} — {j.company || 'Direct Role'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          Evaluating skills and employer requirements...
        </div>
      )}

      {gapData && !loading && (
        <>
          {/* COMPARISON VIEW: YOUR SKILLS VS ROLE REQUIREMENTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'stretch' }}>
            {/* Left Panel: YOUR SKILLS */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.06em' }}>
                    CANDIDATE BACKGROUND
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                    YOUR SKILLS
                  </h3>
                </div>
                <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                  {gapData.yourSkills?.length || gapData.verifiedCount || 0} Verified
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Verified technical competencies, frameworks, and tools present in your profile/resume:
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '12px',
                background: 'var(--bg-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                minHeight: '120px'
              }}>
                {(gapData.yourSkills || []).length === 0 ? (
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No verified skills listed.</span>
                ) : (
                  (gapData.yourSkills || []).map((skill, sIdx) => {
                    const isMatched = matchedList.some(m => m.name.toLowerCase() === skill.toLowerCase());
                    return (
                      <span
                        key={sIdx}
                        className={`badge ${isMatched ? 'badge-success' : 'badge-neutral'}`}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        {isMatched ? '✓ ' : ''}{skill}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Center VS Indicator */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 8px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '13px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}>
                VS
              </div>
            </div>

            {/* Right Panel: ROLE REQUIREMENTS */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #7C3AED' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#7C3AED', letterSpacing: '0.06em' }}>
                    TARGET EMPLOYER SPECIFICATION
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                    ROLE REQUIREMENTS
                  </h3>
                </div>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  {gapData.roleRequirements?.length || (matchedList.length + partialList.length + missingList.length)} Demanded
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Target role: <strong>{selectedJob?.role || 'Software Engineer'}</strong> at <strong>{selectedJob?.company || 'Company'}</strong>:
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '12px',
                background: 'var(--bg-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                minHeight: '120px'
              }}>
                {(gapData.roleRequirements || []).length === 0 ? (
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No role requirements parsed.</span>
                ) : (
                  (gapData.roleRequirements || []).map((req, rIdx) => {
                    const reqName = typeof req === 'string' ? req : req.name;
                    const isMatched = matchedList.some(m => m.name.toLowerCase() === reqName.toLowerCase());
                    const isMissing = missingList.some(m => m.name.toLowerCase() === reqName.toLowerCase());

                    return (
                      <span
                        key={rIdx}
                        className={`badge ${isMatched ? 'badge-success' : isMissing ? 'badge-danger' : 'badge-warning'}`}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        {isMatched ? '✓ ' : isMissing ? '✕ ' : '⚠ '}{reqName}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 3 CATEGORIES: MATCHED, PARTIAL, MISSING */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Skill & Keyword Alignment Categories
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Audited into three distinct integrity classes with clear actionable recommendations.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('ALL')}
                  className={`btn btn-sm ${activeCategoryTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px' }}
                >
                  All ({matchedList.length + partialList.length + missingList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('MATCHED')}
                  className={`btn btn-sm ${activeCategoryTab === 'MATCHED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px', color: activeCategoryTab === 'MATCHED' ? '#fff' : 'var(--success)' }}
                >
                  ✓ Matched ({matchedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('PARTIAL')}
                  className={`btn btn-sm ${activeCategoryTab === 'PARTIAL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px', color: activeCategoryTab === 'PARTIAL' ? '#fff' : '#D97706' }}
                >
                  ⚠ Partial ({partialList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('MISSING')}
                  className={`btn btn-sm ${activeCategoryTab === 'MISSING' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px', color: activeCategoryTab === 'MISSING' ? '#fff' : 'var(--danger)' }}
                >
                  ✕ Missing ({missingList.length})
                </button>
              </div>
            </div>

            {/* List of Category Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Category: Matched */}
              {(activeCategoryTab === 'ALL' || activeCategoryTab === 'MATCHED') && matchedList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} />
                    <span>MATCHED SKILLS ({matchedList.length})</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {matchedList.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                            {item.name}
                          </span>
                          <span className="badge badge-success" style={{ fontSize: '11px' }}>
                            {item.matchType || 'Verified Match'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#15803D' }}>
                          {item.evidence || 'Verified in candidate resume against target role.'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Partial */}
              {(activeCategoryTab === 'ALL' || activeCategoryTab === 'PARTIAL') && partialList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} />
                    <span>PARTIAL / RELATED SKILLS ({partialList.length})</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {partialList.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                            {item.name}
                          </span>
                          <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                            Partial Match
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#78350F', lineHeight: '1.4' }}>
                          <strong>Recommendation:</strong> {item.recommendation || `Strengthen contextual mention of ${item.name} in your project deliverables.`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Missing */}
              {(activeCategoryTab === 'ALL' || activeCategoryTab === 'MISSING') && missingList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle size={16} />
                      <span>MISSING ROLE REQUIREMENTS ({missingList.length})</span>
                    </div>
                    <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                      Do Not Fabricate
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                    {missingList.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                              Missing:
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B' }}>
                              {item.name}
                            </span>
                          </div>
                          <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                            {item.priority || 'Required'}
                          </span>
                        </div>

                        {/* Concrete Recommendation */}
                        <div style={{
                          padding: '10px 12px',
                          background: '#FFFFFF',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#7F1D1D',
                          lineHeight: '1.45'
                        }}>
                          <strong>Recommendation:</strong>
                          <div style={{ marginTop: '3px' }}>
                            "{item.recommendation || `Consider learning ${item.name} because it is listed as a required technology in the supplied job description.`}"
                          </div>
                        </div>

                        {/* Anti-fabrication reminder */}
                        <div style={{ fontSize: '11.5px', color: '#B91C1C', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={13} />
                          <span>Do not pretend you have {item.name}. Build a project before adding to resume.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Learning Roadmaps */}
          {gapData.roadmaps?.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Actionable Learning Roadmaps
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Step-by-step curricula to master missing technologies legitimately before interviewing.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {gapData.roadmaps.map((rm, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '18px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {rm.skill}
                        </span>
                        <span className={`badge ${rm.classification === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                          {rm.classification}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          <span>{rm.estimatedTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BookOpen size={13} />
                          <span>{rm.estimatedLevel}</span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <strong>Why it matters:</strong> {rm.whyItMatters}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          Topics to Master:
                        </div>
                        <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {rm.topics?.map((top, tIdx) => (
                            <li key={tIdx}>{top}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          Suggested Practical Project:
                        </div>
                        <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <Code2 size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--primary)' }} />
                          {rm.suggestedProject}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
