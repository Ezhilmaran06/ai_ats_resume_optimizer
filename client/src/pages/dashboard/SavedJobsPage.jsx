import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Building, MapPin, Sparkles, Trash2, Plus, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      addToast('Error fetching saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id, role) => {
    if (!window.confirm(`Delete job posting for "${role}"?`)) return;
    try {
      const res = await api.delete(`/jobs/${id}`);
      if (res.data.success) {
        addToast('Job posting deleted.', 'info');
        fetchJobs();
      }
    } catch (err) {
      addToast('Error deleting job.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Saved Job Postings</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Job descriptions you have analyzed and their extracted requirement tables.
          </p>
        </div>

        <Link to="/dashboard/jobs/analyze" className="btn btn-primary">
          <Plus size={16} /> Analyze New Job
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '160px' }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Briefcase size={40} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>No saved jobs</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Analyze a job description to extract technical requirements and tailor your resume.
          </p>
          <Link to="/dashboard/jobs/analyze" className="btn btn-primary">
            Analyze Job Description
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {jobs.map(job => (
            <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{job.role}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <Building size={14} />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteJob(job._id, job.role)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>

                {job.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <MapPin size={12} />
                    <span>{job.location}</span>
                  </div>
                )}

                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(job.analysis?.requiredSkills || []).slice(0, 5).map((s, i) => (
                    <span key={i} className="badge badge-neutral" style={{ fontSize: '11px' }}>{s}</span>
                  ))}
                  {(job.analysis?.requiredSkills || []).length > 5 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      +{job.analysis.requiredSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <Link to={`/dashboard/optimizer?jobId=${job._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Sparkles size={14} />
                  <span>Tailor Resume</span>
                </Link>
                <Link to={`/dashboard/ats?jobId=${job._id}`} className="btn btn-secondary btn-sm">
                  ATS Score
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
