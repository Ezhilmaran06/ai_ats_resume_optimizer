import React, { useState } from 'react';
import { Plus, X, Sparkles, Check, AlertCircle, Wrench, Database, Cloud, Code2, Server } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SKILL_CATEGORIES = [
  { key: 'programmingLanguages', label: 'Programming Languages', icon: Code2, placeholder: 'e.g. JavaScript, Python, TypeScript, Java, C++' },
  { key: 'frameworks', label: 'Frameworks & Libraries', icon: Server, placeholder: 'e.g. React, Node.js, Express, Next.js, Django, FastAPI' },
  { key: 'databases', label: 'Databases & Storage', icon: Database, placeholder: 'e.g. MongoDB, PostgreSQL, MySQL, Redis, DynamoDB' },
  { key: 'cloud', label: 'Cloud & DevOps', icon: Cloud, placeholder: 'e.g. AWS (EC2, S3), Docker, Kubernetes, CI/CD, Git, GitHub Actions' },
  { key: 'tools', label: 'Developer Tools', icon: Wrench, placeholder: 'e.g. Postman, Vite, Webpack, Linux, Jira, VS Code' },
  { key: 'softSkills', label: 'Professional & Soft Skills', icon: Sparkles, placeholder: 'e.g. Agile/Scrum, System Design, Technical Leadership, Code Review' },
  { key: 'other', label: 'Other Competencies', icon: Plus, placeholder: 'e.g. RESTful APIs, Microservices, GraphQL, WebSockets' }
];

export default function SkillsSection({ skills = {}, onProfileUpdated }) {
  const { addToast } = useToast();
  const [skillState, setSkillState] = useState(skills || {});
  const [activeCategory, setActiveCategory] = useState('programmingLanguages');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setSkillState(skills || {});
  }, [skills]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    const currentCatSkills = skillState[activeCategory] || [];
    if (currentCatSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      addToast(`"${trimmed}" is already in this category.`, 'warning');
      return;
    }

    const updatedCategory = [...currentCatSkills, trimmed];
    const updatedSkills = {
      ...skillState,
      [activeCategory]: updatedCategory
    };

    setSkillState(updatedSkills);
    setNewSkillInput('');

    try {
      setSaving(true);
      const res = await api.put('/profile', { skills: updatedSkills });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(`Added "${trimmed}" to verified skills!`, 'success');
      }
    } catch (err) {
      addToast('Error persisting skill.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (categoryKey, skillToRemove) => {
    const updatedCategory = (skillState[categoryKey] || []).filter(s => s !== skillToRemove);
    const updatedSkills = {
      ...skillState,
      [categoryKey]: updatedCategory
    };

    setSkillState(updatedSkills);

    try {
      setSaving(true);
      const res = await api.put('/profile', { skills: updatedSkills });
      if (res.data.success) {
        onProfileUpdated(res.data.data);
        addToast(`Removed "${skillToRemove}".`, 'info');
      }
    } catch (err) {
      addToast('Error removing skill.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalSkillsCount = Object.values(skillState).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Verified Technical Skills</h3>
            <span className="badge badge-primary">{totalSkillsCount} Skills Verified</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            The AI ATS engine strictly checks candidate keywords against these skills without inventing false claims.
          </p>
        </div>
      </div>

      {/* Add Skill Quick Bar */}
      <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <select
          className="form-input"
          style={{ width: '220px' }}
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          {SKILL_CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <input
          type="text"
          className="form-input"
          style={{ flex: 1, minWidth: '200px' }}
          placeholder="Type skill name and press Enter (e.g. React, Docker, Python)..."
          value={newSkillInput}
          onChange={(e) => setNewSkillInput(e.target.value)}
        />

        <button type="submit" disabled={!newSkillInput.trim() || saving} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Skill</span>
        </button>
      </form>

      {/* Categorized Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {SKILL_CATEGORIES.map(cat => {
          const items = skillState[cat.key] || [];
          const Icon = cat.icon;

          return (
            <div
              key={cat.key}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  <Icon size={16} color="var(--primary)" />
                  <span>{cat.label}</span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                  {items.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '36px' }}>
                {items.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No skills added in this category yet.
                  </span>
                ) : (
                  items.map(skill => (
                    <span
                      key={skill}
                      className="badge badge-neutral"
                      style={{
                        padding: '5px 10px',
                        fontSize: '12.5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(cat.key, skill)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={`Remove ${skill}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
