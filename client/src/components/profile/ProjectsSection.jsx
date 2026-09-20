import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, FolderGit2, Globe, Github, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProjectsSection({ projects = [], onProfileUpdated }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(projects || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
    achievements: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setItems(projects || []);
  }, [projects]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Project name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      role: 'Creator & Lead Developer',
      description: '',
      technologies: '',
      projectUrl: '',
      githubUrl: '',
      achievements: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setFormData({
      name: item.name || '',
      role: item.role || '',
      description: item.description || '',
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : (item.technologies || ''),
      projectUrl: item.projectUrl || '',
      githubUrl: item.githubUrl || '',
      achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : (item.achievements || '')
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse technologies and achievements arrays
    const formattedItem = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      description: formData.description.trim(),
      projectUrl: formData.projectUrl.trim(),
      githubUrl: formData.githubUrl.trim(),
      technologies: formData.technologies
        ? formData.technologies.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      achievements: formData.achievements
        ? formData.achievements.split('\n').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      setSubmitting(true);
      let updatedList = [...items];

      if (editingIndex !== null) {
        const itemId = items[editingIndex]._id;
        if (itemId) {
          const res = await api.put(`/profile/section/projects/${itemId}`, formattedItem);
          if (res.data.success) {
            onProfileUpdated(res.data.data);
            addToast('Project updated successfully!', 'success');
            setModalOpen(false);
            return;
          }
        }
        updatedList[editingIndex] = { ...updatedList[editingIndex], ...formattedItem };
      } else {
        const res = await api.post('/profile/section/projects', formattedItem);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Project added!', 'success');
          setModalOpen(false);
          return;
        }
        updatedList.push({ ...formattedItem, order: updatedList.length });
      }

      // Fallback
      const res = await api.put('/profile', { projects: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(editingIndex !== null ? 'Project updated!' : 'Project added!', 'success');
        setModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];
    try {
      if (item._id) {
        const res = await api.delete(`/profile/section/projects/${item._id}`);
        if (res.data.success) {
          onProfileUpdated(res.data.data);
          addToast('Project removed.', 'info');
          return;
        }
      }
      const updatedList = items.filter((_, i) => i !== index);
      const res = await api.put('/profile', { projects: updatedList });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast('Project removed.', 'info');
      }
    } catch (err) {
      addToast('Error removing project.', 'error');
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
      const res = await api.put('/profile/section/projects/reorder', { items: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      const res = await api.put('/profile', { projects: ordered });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Projects & Technical Systems</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real technical applications, open-source repositories, and systems you engineered.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Add Project</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <FolderGit2 size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>No projects added yet</div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Showcasing 2-3 verified projects significantly increases technical ATS relevance scores.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            <Plus size={14} /> Add First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((proj, idx) => (
            <div
              key={proj._id || idx}
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
                    {proj.name}
                  </h4>
                  {proj.role && <span className="badge badge-info">{proj.role}</span>}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <Github size={13} /> Code
                    </a>
                  )}
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)' }}>
                      <Globe size={13} /> Live Demo
                    </a>
                  )}
                </div>

                {proj.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                    {proj.description}
                  </p>
                )}

                {/* Technologies */}
                {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {proj.technologies.map(tech => (
                      <span key={tech} className="badge badge-neutral" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {Array.isArray(proj.achievements) && proj.achievements.length > 0 && (
                  <ul style={{ marginTop: '10px', paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {proj.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
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

      {/* Add / Edit Project Modal */}
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
          <div className="card" style={{ maxWidth: '580px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingIndex !== null ? 'Edit Project' : 'Add Project'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Real-Time Distributed Task Queue"
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

                <div className="form-group">
                  <label className="form-label">Your Role</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lead Architect, Full-Stack Dev"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Technologies Used (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Node.js, Redis, Docker, TypeScript"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/username/project"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Live Demo / Project URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://project-demo.io"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Summary of purpose, architecture, and engineering challenges solved..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Measurable Achievements / Key Highlights (One per line)</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Achieved 95% unit test coverage using Jest&#10;Handled 10,000 requests/sec with sub-50ms latency using Redis caching"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
