import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, GraduationCap, Check, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function EducationSection({ education = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(education);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    cgpa: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setItems(education || []);
  }, [education]);

  const validate = () => {
    const errors = {};
    if (!formData.institution.trim()) {
      errors.institution = 'Institution / University is required.';
    }
    if (!formData.degree.trim()) {
      errors.degree = 'Degree is required (e.g. B.S., M.S., B.Tech).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      cgpa: '',
      description: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setFormData({
      institution: item.institution || '',
      degree: item.degree || '',
      field: item.field || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      cgpa: item.cgpa || '',
      description: item.description || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      let updatedList = [...items];

      if (editingIndex !== null) {
        // Edit existing
        const itemId = items[editingIndex]._id;
        if (itemId) {
          const res = await api.put(`/profile/section/education/${itemId}`, formData);
          if (res.data.success) {
            onProfileUpdated(res.data.data);
            addToast('Education updated successfully!', 'success');
            setModalOpen(false);
            return;
          }
        }
        updatedList[editingIndex] = { ...updatedList[editingIndex], ...formData };
      } else {
        // Add new
        const res = await api.post('/profile/section/education', formData);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Education credential added!', 'success');
          setModalOpen(false);
          return;
        }
        updatedList.push({ ...formData, order: updatedList.length });
      }

      // Fallback save through full profile update
      const res = await api.put('/profile', { education: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(editingIndex !== null ? 'Education updated!' : 'Education added!', 'success');
        setModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save education.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/education/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Education removed.', 'info');
          return;
        }
      }
      const updatedList = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { education: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Education removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing education.', 'error');
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
      const res = await api.put('/profile/section/education/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      // Fallback update
      const res = await api.put('/profile', { education: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Education Credentials</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Academic degrees and verified institutions used for ATS education parsing.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Add Education</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <GraduationCap size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>No education records added yet</div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ATS screening systems require at least one verified degree or academic credential.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            <Plus size={14} /> Add First Degree
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((edu, idx) => (
            <div
              key={edu._id || idx}
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
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h4>
                  {edu.cgpa && <span className="badge badge-neutral">GPA: {edu.cgpa}</span>}
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--primary)', marginTop: '2px' }}>
                  {edu.institution}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : ''}
                </div>
                {edu.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                    {edu.description}
                  </p>
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

      {/* Add / Edit Modal */}
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
          <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingIndex !== null ? 'Edit Education' : 'Add Education'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Institution / University *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. University of California, Berkeley"
                  value={formData.institution}
                  onChange={(e) => {
                    setFormData({ ...formData, institution: e.target.value });
                    if (formErrors.institution) setFormErrors({ ...formErrors, institution: null });
                  }}
                  style={formErrors.institution ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.institution && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                    {formErrors.institution}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Degree *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bachelor of Science"
                    value={formData.degree}
                    onChange={(e) => {
                      setFormData({ ...formData, degree: e.target.value });
                      if (formErrors.degree) setFormErrors({ ...formErrors, degree: null });
                    }}
                    style={formErrors.degree ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {formErrors.degree && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.degree}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Field of Study</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science"
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Year</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2019"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Year</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2023"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CGPA / Grade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 3.8 / 4.0"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Honors (Optional)</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Key coursework, honors list, academic projects..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
