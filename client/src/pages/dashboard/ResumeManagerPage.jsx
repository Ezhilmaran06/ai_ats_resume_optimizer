import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
  Gauge,
  Download,
  Plus,
  ArrowRight,
  GitCompare,
  X,
  ShieldCheck,
  Building,
  Briefcase
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diffModalData, setDiffModalData] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Rename state
  const [renameModalResume, setRenameModalResume] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [newResumeTemplate, setNewResumeTemplate] = useState('ats-classic');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      addToast('Error fetching resumes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (!newResumeTitle.trim()) {
      addToast('Please enter a resume title.', 'error');
      return;
    }
    try {
      setCreating(true);
      const res = await api.post('/resumes', {
        title: newResumeTitle.trim(),
        name: newResumeTitle.trim(),
        templateId: newResumeTemplate,
        template: newResumeTemplate,
        fromMaster: true
      });
      if (res.data.success) {
        addToast('Resume created successfully!', 'success');
        setShowCreateModal(false);
        setNewResumeTitle('');
        navigate(`/dashboard/builder/${res.data.data._id}`);
      }
    } catch (err) {
      addToast('Failed to create resume.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/resumes/${id}/duplicate`);
      if (res.data.success) {
        addToast('Resume duplicated!', 'success');
        fetchResumes();
      }
    } catch (err) {
      addToast('Failed to duplicate resume.', 'error');
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameValue.trim()) {
      addToast('Please enter a valid title.', 'error');
      return;
    }
    try {
      setRenaming(true);
      const res = await api.put(`/resumes/${renameModalResume._id}/rename`, {
        name: renameValue.trim(),
        title: renameValue.trim()
      });
      if (res.data.success) {
        addToast('Resume renamed successfully!', 'success');
        setRenameModalResume(null);
        setRenameValue('');
        fetchResumes();
      }
    } catch (err) {
      addToast('Failed to rename resume.', 'error');
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await api.delete(`/resumes/${id}`);
      if (res.data.success) {
        addToast('Resume deleted.', 'info');
        fetchResumes();
      }
    } catch (err) {
      addToast('Failed to delete resume.', 'error');
    }
  };

  const handleCompareDiff = async (id) => {
    try {
      setDiffLoading(true);
      const res = await api.get(`/resumes/${id}/compare`);
      if (res.data.success) {
        setDiffModalData(res.data.data);
      }
    } catch (err) {
      addToast('Failed to calculate version diff.', 'error');
    } finally {
      setDiffLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>My Resumes</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create, edit, duplicate, rename, and manage your ATS-optimized tailored resumes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} />
            Create New Resume
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '180px' }} />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.4, color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No resumes created yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            Generate your first ATS-optimized resume directly from your verified Master Profile.
          </p>
          <Link to="/dashboard/builder" className="btn btn-primary">
            <Plus size={16} /> Create Master Resume
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {resumes.map((r) => (
            <div
              key={r._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderTop: r.isMaster ? '4px solid var(--primary)' : '1px solid var(--border-color)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{r.title}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Template: <strong style={{ textTransform: 'capitalize' }}>{r.templateId?.replace('-', ' ')}</strong>
                    </div>
                  </div>
                  {r.atsScore?.overallScore > 0 ? (
                    <div className="badge badge-success" style={{ fontSize: '13px', fontWeight: '700' }}>
                      {r.atsScore.overallScore} ATS
                    </div>
                  ) : (
                    <span className="badge badge-neutral">Unscored</span>
                  )}
                </div>

                {/* Target tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0' }}>
                  {r.targetRole && (
                    <span className="badge badge-info" style={{ gap: '4px' }}>
                      <Briefcase size={12} /> {r.targetRole}
                    </span>
                  )}
                  {r.targetCompany && (
                    <span className="badge badge-neutral" style={{ gap: '4px' }}>
                      <Building size={12} /> {r.targetCompany}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Updated: {new Date(r.updatedAt).toLocaleDateString()} • v{r.versionNumber || 1}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Link to={`/dashboard/builder/${r._id}`} className="btn btn-primary btn-sm" title="Edit in visual builder">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <Link to={`/dashboard/optimizer?resumeId=${r._id}`} className="btn btn-secondary btn-sm" title="Tailor for a job">
                    <Sparkles size={14} color="var(--primary)" /> Tailor
                  </Link>
                  <button onClick={() => handleCompareDiff(r._id)} className="btn btn-secondary btn-sm" title="Compare against Master Profile">
                    <GitCompare size={14} /> Diff
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setRenameModalResume(r);
                      setRenameValue(r.title || r.name || '');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Rename Resume"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDuplicate(r._id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="Duplicate">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleDelete(r._id, r.title || r.name)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE RESUME MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Create New Resume</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateResume}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Resume Name
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Senior Frontend Engineer 2026"
                  value={newResumeTitle}
                  onChange={(e) => setNewResumeTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Choose Template
                </label>
                <select
                  className="input"
                  value={newResumeTemplate}
                  onChange={(e) => setNewResumeTemplate(e.target.value)}
                >
                  <option value="ats-classic">ATS Classic (High Machine Readability)</option>
                  <option value="modern-pro">Modern Professional</option>
                  <option value="swe">Software Engineer</option>
                  <option value="fresh-grad">Fresh Graduate</option>
                  <option value="minimal">Minimal Clean</option>
                  <option value="executive">Executive Leadership</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? 'Creating...' : 'Create & Open Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME RESUME MODAL */}
      {renameModalResume && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Rename Resume</h3>
              <button onClick={() => setRenameModalResume(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRenameSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  New Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRenameModalResume(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={renaming} className="btn btn-primary">
                  {renaming ? 'Saving...' : 'Rename'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERSION DIFF MODAL */}
      {diffModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCompare size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Version Diff Comparison</h3>
              </div>
              <button
                onClick={() => setDiffModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Comparing <strong>{diffModalData.title?.master}</strong> vs <strong>{diffModalData.title?.tailored}</strong>
            </div>

            {/* Summary Diff */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Professional Summary {diffModalData.summary?.isModified ? '(Modified ~)' : '(Unchanged)'}
              </div>
              <div style={{ padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '12.5px', lineHeight: '1.5' }}>
                {diffModalData.summary?.tailored || 'No summary'}
              </div>
            </div>

            {/* Skills Added / Removed */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Skills Prioritized (+ Added / - Removed)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {diffModalData.skills?.added?.length === 0 && diffModalData.skills?.removed?.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Identical skill lists.</span>
                ) : (
                  <>
                    {diffModalData.skills?.added?.map((s, i) => (
                      <span key={i} className="badge badge-success" style={{ fontSize: '12px' }}>+ {s}</span>
                    ))}
                    {diffModalData.skills?.removed?.map((s, i) => (
                      <span key={i} className="badge badge-danger" style={{ fontSize: '12px' }}>- {s}</span>
                    ))}
                  </>
                )}
              </div>
            </div>

            <button onClick={() => setDiffModalData(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Close Diff
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
