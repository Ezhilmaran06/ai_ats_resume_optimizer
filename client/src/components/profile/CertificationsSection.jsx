import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Award, ExternalLink, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CertificationsSection({ certifications = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(certifications || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setItems(certifications || []);
  }, [certifications]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Certification name is required.';
    }
    if (!formData.issuer.trim()) {
      errors.issuer = 'Issuing organization is required (e.g. AWS, Google, Microsoft).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      issuer: '',
      date: new Date().getFullYear().toString(),
      credentialUrl: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setFormData({
      name: item.name || '',
      issuer: item.issuer || '',
      date: item.date || '',
      credentialUrl: item.credentialUrl || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedItem = {
      name: formData.name.trim(),
      issuer: formData.issuer.trim(),
      date: formData.date.trim(),
      credentialUrl: formData.credentialUrl.trim()
    };

    try {
      setSubmitting(true);
      let updatedList = [...items];

      if (editingIndex !== null) {
        const itemId = items[editingIndex]._id;
        if (itemId) {
          const res = await api.put(`/profile/section/certifications/${itemId}`, formattedItem);
          if (res.data.success) {
            onProfileUpdated(res.data.data);
            addToast('Certification updated successfully!', 'success');
            setModalOpen(false);
            return;
          }
        }
        updatedList[editingIndex] = { ...updatedList[editingIndex], ...formattedItem };
      } else {
        const res = await api.post('/profile/section/certifications', formattedItem);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Certification added!', 'success');
          setModalOpen(false);
          return;
        }
        updatedList.push({ ...formattedItem, order: updatedList.length });
      }

      // Fallback
      const res = await api.put('/profile', { certifications: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(editingIndex !== null ? 'Certification updated!' : 'Certification added!', 'success');
        setModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving certification.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/certifications/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Certification removed.', 'info');
          return;
        }
      }
      const updatedList = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { certifications: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Certification removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing certification.', 'error');
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
      const res = await api.put('/profile/section/certifications/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      const res = await api.put('/profile', { certifications: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Industry Certifications</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Verified technical licenses and credential badges recognized by ATS parsers.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Add Certification</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <Award size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>No certifications added yet</div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Add cloud certifications (AWS, GCP, Azure, CKA) or vendor credentials to boost screening ranking.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            <Plus size={14} /> Add Certification
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((cert, idx) => (
            <div
              key={cert._id || idx}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {cert.name}
                  </h4>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: 'var(--primary)' }}
                    >
                      <ExternalLink size={12} /> Verify
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {cert.issuer} {cert.date && `• Issued ${cert.date}`}
                </div>
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

      {/* Add / Edit Certification Modal */}
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
                {editingIndex !== null ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Certification Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AWS Certified Solutions Architect - Associate"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                  }}
                  style={formErrors.name ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Issuing Organization *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Amazon Web Services"
                    value={formData.issuer}
                    onChange={(e) => {
                      setFormData({ ...formData, issuer: e.target.value });
                      if (formErrors.issuer) setFormErrors({ ...formErrors, issuer: null });
                    }}
                    style={formErrors.issuer ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {formErrors.issuer && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.issuer}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Year Issued</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2023"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Credential Verification URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.credly.com/badges/..."
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
