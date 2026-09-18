import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Building,
  Briefcase,
  FileText,
  DollarSign,
  X,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ApplicationTrackerPage() {
  const { addToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt');

  // Modal form for adding/editing application
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    salary: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().split('T')[0],
    deadline: '',
    resumeUsed: '',
    atsScore: 82,
    jobUrl: '',
    notes: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchResumes();
  }, [filterStatus, search, sortBy]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications', {
        params: { status: filterStatus, search, sort: sortBy }
      });
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      console.error('Error loading resumes:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setFormData({
      company: '',
      role: '',
      location: '',
      salary: '',
      status: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0],
      deadline: '',
      resumeUsed: resumes[0]?._id || '',
      atsScore: 82,
      jobUrl: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setFormData({
      company: app.company,
      role: app.role,
      location: app.location || '',
      salary: app.salary || '',
      status: app.status || 'Applied',
      dateApplied: app.dateApplied ? new Date(app.dateApplied).toISOString().split('T')[0] : '',
      deadline: app.deadline ? new Date(app.deadline).toISOString().split('T')[0] : '',
      resumeUsed: app.resumeUsed?._id || app.resumeUsed || '',
      atsScore: app.atsScore || 0,
      jobUrl: app.jobUrl || '',
      notes: app.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await api.put(`/applications/${editingApp._id}`, formData);
        addToast('Application updated!', 'success');
      } else {
        await api.post('/applications', formData);
        addToast('Application added to tracker!', 'success');
      }
      setShowModal(false);
      fetchApplications();
    } catch (err) {
      addToast('Error saving application.', 'error');
    }
  };

  const handleDeleteApp = async (id, role) => {
    if (!window.confirm(`Delete application for "${role}"?`)) return;
    try {
      await api.delete(`/applications/${id}`);
      addToast('Application removed.', 'info');
      fetchApplications();
    } catch (err) {
      addToast('Error deleting application.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer': return 'badge-success';
      case 'Interview': return 'badge-info';
      case 'Online Assessment': return 'badge-warning';
      case 'Applied': return 'badge-neutral';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Job Application Pipeline Tracker</h2>
            <span className="badge badge-info" style={{ gap: '4px' }}>
              <Send size={14} /> Career Pipeline
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Keep track of which tailored resume was submitted, interview stages, and deadlines.
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={16} /> Track New Application
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Sort By:</span>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="company">Company (A-Z)</option>
            <option value="atsScore">ATS Score</option>
          </select>
        </div>
      </div>

      {/* Applications Table View */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <Send size={40} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '4px' }}>No applications in this view</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Add job applications to track progress from submission through offer letter.
            </p>
            <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Application
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px' }}>Company & Role</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Resume Used</th>
                  <th style={{ padding: '12px 16px' }}>ATS Match</th>
                  <th style={{ padding: '12px 16px' }}>Date Applied</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{app.role}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} /> {app.company} {app.location ? `• ${app.location}` : ''}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {app.resumeTitle || app.resumeUsed?.title || 'Master Resume'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {app.atsScore ? (
                        <span className="badge badge-success">{app.atsScore}%</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString() : 'Not applied'}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => handleOpenEditModal(app)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDeleteApp(app._id, app.role)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
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
          <div className="card" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingApp ? 'Edit Application' : 'Track New Application'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Application Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resume Used</label>
                  <select
                    className="form-select"
                    value={formData.resumeUsed}
                    onChange={(e) => setFormData({ ...formData, resumeUsed: e.target.value })}
                  >
                    <option value="">Master Resume</option>
                    {resumes.map(r => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date Applied</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dateApplied}
                    onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary / Compensation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="$140k - $160k"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Referral contact, recruiter info, interview rounds..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingApp ? 'Save Changes' : 'Track Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
