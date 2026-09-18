import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code2,
  Clock,
  Briefcase,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SkillGapPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState(null);

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
      console.error('Error fetching jobs:', err);
    }
  };

  const handleFetchRoadmap = async () => {
    if (!selectedJobId) return;
    try {
      setLoading(true);
      const res = await api.post('/skills/gap-roadmap', {
        jobId: selectedJobId
      });
      if (res.data.success) {
        setGapData(res.data.data);
      }
    } catch (err) {
      addToast('Error calculating skill gap roadmap.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      handleFetchRoadmap();
    }
  }, [selectedJobId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Skill Gap & Learning Roadmap</h2>
            <span className="badge badge-info" style={{ gap: '4px' }}>
              <Compass size={14} /> Career Growth
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Identifies missing technologies demanded by the employer and generates structured learning steps.
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

      {gapData && (
        <>
          {/* Skill Gap Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Critical Gaps */}
            <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--danger)' }}>Critical Gaps</span>
                <span className="badge badge-danger">High Priority</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Required technical skills missing from verified profile:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {gapData.criticalGaps?.length === 0 ? (
                  <span style={{ fontSize: '12.5px', color: 'var(--success)' }}>✓ Zero critical gaps!</span>
                ) : (
                  gapData.criticalGaps?.map((g, i) => (
                    <span key={i} className="badge badge-danger" style={{ fontSize: '12px' }}>{g.name}</span>
                  ))
                )}
              </div>
            </div>

            {/* Important Gaps */}
            <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--warning)' }}>Important Gaps</span>
                <span className="badge badge-warning">Medium Priority</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Secondary or preferred requirements:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {gapData.importantGaps?.length === 0 ? (
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>None</span>
                ) : (
                  gapData.importantGaps?.map((g, i) => (
                    <span key={i} className="badge badge-warning" style={{ fontSize: '12px' }}>{g.name}</span>
                  ))
                )}
              </div>
            </div>

            {/* Nice to Have */}
            <div className="card" style={{ borderTop: '4px solid var(--info)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--info)' }}>Nice to Have</span>
                <span className="badge badge-info">Optional</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Bonus domain capabilities:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {gapData.niceToHaveGaps?.length === 0 ? (
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>None</span>
                ) : (
                  gapData.niceToHaveGaps?.map((g, i) => (
                    <span key={i} className="badge badge-neutral" style={{ fontSize: '12px' }}>{g.name}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detailed Learning Roadmaps */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Structured Learning Roadmaps</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Targeted curricula to bridge skill gaps before your interview.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(gapData.roadmaps || []).map((rm, idx) => (
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Topics to Master:
                      </div>
                      <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
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
        </>
      )}
    </div>
  );
}
