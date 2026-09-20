import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Languages, Check, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Elementary'];

export default function LanguagesSection({ languages = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(languages || []);
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('Professional');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setItems(languages || []);
  }, [languages]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLanguage.trim()) return;

    const newItem = {
      language: newLanguage.trim(),
      proficiency: newProficiency,
      order: items.length
    };

    try {
      setSubmitting(true);
      const res = await api.post('/profile/section/languages', newItem);
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        setNewLanguage('');
        addToast('Language added!', 'success');
        return;
      }
    } catch (err) {
      // Fallback
      const updated = [...items, newItem];
      const res = await api.put('/profile', { languages: updated });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        setNewLanguage('');
        addToast('Language added!', 'success');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/languages/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Language removed.', 'info');
          return;
        }
      }
      const updated = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { languages: updated });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Language removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing language.', 'error');
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
      const res = await api.put('/profile/section/languages/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      const res = await api.put('/profile', { languages: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Spoken Languages</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          International communication proficiencies and native tongues.
        </p>
      </div>

      {/* Add Language Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. English, Spanish, French"
          style={{ flex: 1, minWidth: '180px' }}
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
        />

        <select
          className="form-input"
          style={{ width: '180px' }}
          value={newProficiency}
          onChange={(e) => setNewProficiency(e.target.value)}
        >
          {PROFICIENCY_LEVELS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button type="submit" disabled={!newLanguage.trim() || submitting} className="btn btn-primary">
          <Plus size={15} />
          <span>Add Language</span>
        </button>
      </form>

      {/* Languages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No languages added yet.
          </div>
        ) : (
          items.map((lang, idx) => (
            <div
              key={lang._id || idx}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {lang.language}
                </span>
                <span className="badge badge-info">{lang.proficiency}</span>
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
