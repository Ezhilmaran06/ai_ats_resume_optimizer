import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Trophy, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AchievementsSection({ achievements = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(achievements || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setItems(achievements || []);
  }, [achievements]);

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Achievement or honor title is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().getFullYear().toString()
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setFormData({
      title: item.title || '',
      description: item.description || '',
      date: item.date || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedItem = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date.trim()
    };

    try {
      setSubmitting(true);
      let updatedList = [...items];

      if (editingIndex !== null) {
        const itemId = items[editingIndex]._id;
        if (itemId) {
          const res = await api.put(`/profile/section/achievements/${itemId}`, formattedItem);
          if (res.data.success) {
            onProfileUpdated(res.data.data);
            addToast('Achievement updated!', 'success');
            setModalOpen(false);
            return;
          }
        }
        updatedList[editingIndex] = { ...updatedList[editingIndex], ...formattedItem };
      } else {
        const res = await api.post('/profile/section/achievements', formattedItem);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Achievement added!', 'success');
          setModalOpen(false);
          return;
        }
        updatedList.push({ ...formattedItem, order: updatedList.length });
      }

      // Fallback
      const res = await api.put('/profile', { achievements: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(editingIndex !== null ? 'Achievement updated!' : 'Achievement added!', 'success');
        setModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving achievement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/achievements/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Achievement removed.', 'info');
          return;
        }
      }
      const updatedList = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { achievements: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Achievement removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing achievement.', 'error');
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
      const res = await api.put('/profile/section/achievements/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      const res = await api.put('/profile', { achievements: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Key Achievements & Honors</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Competitive hackathon awards, academic honors, scholarships, and notable professional milestones.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Add Achievement</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <Trophy size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>No achievements recorded yet</div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Documenting hackathons, competitions, or leadership recognitions strengthens candidate differentiation.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            <Plus size={14} /> Add First Achievement
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((ach, idx) => (
            <div
              key={ach._id || idx}
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
                    {ach.title}
                  </h4>
                  {ach.date && <span className="badge badge-neutral">{ach.date}</span>}
                </div>
                {ach.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                    {ach.description}
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

      {/* Add / Edit Achievement Modal */}
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
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingIndex !== null ? 'Edit Achievement' : 'Add Achievement'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Honor / Achievement Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CalHacks AI Division - 1st Place"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                  }}
                  style={formErrors.title ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.title && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                    {formErrors.title}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Year / Date</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2024"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Details of the award, scale of competition, or impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
