import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Briefcase, Calendar, MapPin, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ExperienceSection({ experience = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(experience || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
    achievements: '',
    technologies: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setItems(experience || []);
  }, [experience]);

  const validate = () => {
    const errors = {};
    if (!formData.company.trim()) {
      errors.company = 'Company name is required.';
    }
    if (!formData.role.trim()) {
      errors.role = 'Role / Job title is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      currentlyWorking: true,
      description: '',
      achievements: '',
      technologies: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setFormData({
      company: item.company || '',
      role: item.role || '',
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      currentlyWorking: Boolean(item.currentlyWorking),
      description: item.description || '',
      achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : (item.achievements || ''),
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : (item.technologies || '')
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedItem = {
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      startDate: formData.startDate.trim(),
      endDate: formData.currentlyWorking ? 'Present' : formData.endDate.trim(),
      currentlyWorking: formData.currentlyWorking,
      description: formData.description.trim(),
      achievements: formData.achievements
        ? formData.achievements.split('\n').map(s => s.trim()).filter(Boolean)
        : [],
      technologies: formData.technologies
        ? formData.technologies.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      setSubmitting(true);
      let updatedList = [...items];

      if (editingIndex !== null) {
        const itemId = items[editingIndex]._id;
        if (itemId) {
          const res = await api.put(`/profile/section/experience/${itemId}`, formattedItem);
          if (res.data.success) {
            onProfileUpdated(res.data.data);
            addToast('Experience updated successfully!', 'success');
            setModalOpen(false);
            return;
          }
        }
        updatedList[editingIndex] = { ...updatedList[editingIndex], ...formattedItem };
      } else {
        const res = await api.post('/profile/section/experience', formattedItem);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Experience added!', 'success');
          setModalOpen(false);
          return;
        }
        updatedList.push({ ...formattedItem, order: updatedList.length });
      }

      // Fallback
      const res = await api.put('/profile', { experience: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(editingIndex !== null ? 'Experience updated!' : 'Experience added!', 'success');
        setModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving experience.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/experience/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Experience position removed.', 'info');
          return;
        }
      }
      const updatedList = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { experience: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Experience position removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing position.', 'error');
    }
  };

  const handleReorder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const list = [...items];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const ordered = list.map((it, idx) => ({ ...it, order: idx }));
    setItems(ordered);

    try {
      const res = await api.put('/profile/section/experience/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      const res = await api.put('/profile', { experience: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Work Experience</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Verified professional roles and quantifiable achievements. Ground truth for ATS tailoring.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Add Position</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <Briefcase size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>No experience records added yet</div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ATS algorithms evaluate employment tenure, progression, and quantified metrics.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            <Plus size={14} /> Add First Position
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((exp, idx) => (
            <div
              key={exp._id || idx}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {exp.role}
                  </h4>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                    @ {exp.company}
                  </span>
                  {exp.currentlyWorking && <span className="badge badge-success">Present</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>{exp.startDate ? `${exp.startDate} – ${exp.currentlyWorking ? 'Present' : (exp.endDate || '')}` : ''}</span>
                  {exp.location && <span>• {exp.location}</span>}
                </div>

                {exp.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                    {exp.description}
                  </p>
                )}

                {/* Achievements List */}
                {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                  <ul style={{ marginTop: '10px', paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}

                {/* Technologies */}
                {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {exp.technologies.map(tech => (
                      <span key={tech} className="badge badge-neutral" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleReorder(idx, -1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px' }}
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => handleReorder(idx, 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px' }}
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px' }}
                  title="Edit"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '6px' }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Experience Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingIndex !== null ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Role / Job Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Full-Stack Software Engineer"
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      if (formErrors.role) setFormErrors({ ...formErrors, role: null });
                    }}
                    style={formErrors.role ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {formErrors.role && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.role}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Apex Cloud Solutions"
                    value={formData.company}
                    onChange={(e) => {
                      setFormData({ ...formData, company: e.target.value });
                      if (formErrors.company) setFormErrors({ ...formErrors, company: null });
                    }}
                    style={formErrors.company ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {formErrors.company && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.company}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="YYYY-MM (e.g. 2022-03)"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="text"
                    disabled={formData.currentlyWorking}
                    className="form-input"
                    placeholder={formData.currentlyWorking ? 'Present' : 'YYYY-MM'}
                    value={formData.currentlyWorking ? 'Present' : formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="currentlyWorking"
                  checked={formData.currentlyWorking}
                  onChange={(e) => setFormData({ ...formData, currentlyWorking: e.target.checked })}
                />
                <label htmlFor="currentlyWorking" style={{ fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                  I currently work in this role
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Role Description</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Overview of responsibilities and team context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantified Bullet Achievements (One per line)</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Engineered decoupled microservices in Node.js, improving API latency by 32%&#10;Mentored 4 junior engineers and implemented automated CI/CD pipeline cutting deployment time by 50%"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technologies Used (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React, TypeScript, Node.js, Docker, AWS"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
