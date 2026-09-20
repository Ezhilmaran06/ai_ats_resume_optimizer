import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Link2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function LinksSection({ links = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(links || []);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setItems(links || []);
  }, [links]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) {
      addToast('Please provide both link label and URL.', 'warning');
      return;
    }

    const newItem = {
      label: newLabel.trim(),
      url: newUrl.trim(),
      order: items.length
    };

    try {
      setSubmitting(true);
      const res = await api.post('/profile/section/links', newItem);
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        setNewLabel('');
        setNewUrl('');
        addToast('Link added!', 'success');
        return;
      }
    } catch (err) {
      // Fallback
      const updated = [...items, newItem];
      const res = await api.put('/profile', { links: updated });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        setNewLabel('');
        setNewUrl('');
        addToast('Link added!', 'success');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);

    try {
      const item = updated[index];
      if (item._id) {
        await api.put(`/profile/section/links/${item._id}`, item);
      } else {
        await api.put('/profile', { links: updated });
      }
    } catch (err) {
      console.error('Failed to update link field', err);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/links/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Link removed.', 'info');
          return;
        }
      }
      const updated = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { links: updated });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Link removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing link.', 'error');
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
      const res = await api.put('/profile/section/links/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      const res = await api.put('/profile', { links: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Professional Web Links</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Portfolio websites, GitHub profiles, LinkedIn accounts, and technical blogs.
        </p>
      </div>

      {/* Add Link Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Label (e.g. GitHub, Portfolio, Blog)"
          style={{ width: '180px' }}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />

        <input
          type="url"
          className="form-input"
          placeholder="https://github.com/yourname"
          style={{ flex: 1, minWidth: '220px' }}
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />

        <button type="submit" disabled={!newLabel.trim() || !newUrl.trim() || submitting} className="btn btn-primary">
          <Plus size={15} />
          <span>Add Link</span>
        </button>
      </form>

      {/* Links List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No links added yet.
          </div>
        ) : (
          items.map((link, idx) => (
            <div
              key={link._id || idx}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '140px' }}
                  value={link.label || ''}
                  onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                />
                <input
                  type="url"
                  className="form-input"
                  style={{ flex: 1 }}
                  value={link.url || ''}
                  onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
                />
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                    title="Open link in new tab"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleReorder(idx, -1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px' }}
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => handleReorder(idx, 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px' }}
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '5px' }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
