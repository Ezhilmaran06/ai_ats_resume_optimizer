import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Plus,
  Trash2,
  Save,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MasterProfilePage() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improvingSummary, setImprovingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Input states for new skill addition
  const [newSkillInput, setNewSkillInput] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('programmingLanguages');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put('/profile', profile);
      if (res.data.success) {
        setProfile(res.data.data);
        addToast('Master Profile saved successfully!', 'success');
      }
    } catch (err) {
      addToast('Error saving profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSaving(true);
      const res = await api.post('/profile/seed-demo');
      if (res.data.success) {
        setProfile(res.data.data);
        addToast('Sample software engineer profile data loaded!', 'success');
      }
    } catch (err) {
      addToast('Failed to load demo profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImproveSummary = async () => {
    try {
      setImprovingSummary(true);
      const res = await api.post('/profile/improve-summary', {
        currentSummary: profile.summary,
        targetRole: profile.personalInfo?.professionalTitle || 'Software Engineer'
      });
      if (res.data.success && res.data.enhancedSummary) {
        setProfile(prev => ({ ...prev, summary: res.data.enhancedSummary }));
        addToast('Professional summary polished by AI!', 'success');
      }
    } catch (err) {
      addToast('Error enhancing summary.', 'error');
    } finally {
      setImprovingSummary(false);
    }
  };

  // Helper for adding skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;

    const currentCategorySkills = profile.skills?.[selectedSkillCategory] || [];
    if (!currentCategorySkills.includes(newSkillInput.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [selectedSkillCategory]: [...currentCategorySkills, newSkillInput.trim()]
        }
      }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (category, skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter(s => s !== skillToRemove)
      }
    }));
  };

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '60px', width: '100%' }} />
        <div className="skeleton" style={{ height: '400px', width: '100%' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Master Profile</h2>
            <span className="badge badge-success" style={{ gap: '4px' }}>
              <ShieldCheck size={12} />
              Verified Source of Truth
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            The AI optimizer only tailors using experiences verified in this master profile. No hallucinations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSeedDemo} className="btn btn-secondary" title="Auto-fill with realistic software developer experience">
            <Sparkles size={16} color="var(--primary)" />
            Load Sample Profile
          </button>
          <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Profile Section Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'personal', label: 'Personal & Links' },
          { id: 'summary', label: 'Summary' },
          { id: 'skills', label: 'Skills' },
          { id: 'experience', label: 'Experience' },
          { id: 'projects', label: 'Projects' },
          { id: 'education', label: 'Education' },
          { id: 'certifications', label: 'Certifications' },
          { id: 'languages', label: 'Languages' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontWeight: 600,
              backgroundColor: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'personal' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Personal Information & Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.personalInfo?.fullName || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, fullName: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={profile.personalInfo?.professionalTitle || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, professionalTitle: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={profile.personalInfo?.email || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, email: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={profile.personalInfo?.phone || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, phone: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (City, Country / Remote)</label>
              <input
                type="text"
                className="form-input"
                placeholder="San Francisco, CA / Remote"
                value={profile.personalInfo?.location || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, location: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                value={profile.personalInfo?.linkedin || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, linkedin: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username"
                value={profile.personalInfo?.github || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, github: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio Website URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourportfolio.dev"
                value={profile.personalInfo?.portfolio || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, portfolio: e.target.value }
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFESSIONAL SUMMARY */}
      {activeTab === 'summary' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Professional Summary</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                A concise 2-3 sentence overview highlighting your verified technical specialties.
              </p>
            </div>
            <button
              onClick={handleImproveSummary}
              disabled={improvingSummary}
              className="btn btn-secondary btn-sm"
              title="Enhance tone and clarity using your verified skills"
            >
              <Sparkles size={14} color="var(--primary)" />
              {improvingSummary ? 'Polishing...' : 'AI Polish (Verified Skills Only)'}
            </button>
          </div>

          <textarea
            className="form-textarea"
            style={{ minHeight: '140px', lineHeight: '1.6' }}
            placeholder="Write your authentic career overview here..."
            value={profile.summary || ''}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
          />
        </div>
      )}

      {/* TAB 3: CATEGORIZED SKILLS */}
      {activeTab === 'skills' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Technical & Soft Skills</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Categorized skills serve as the exact vocabulary for the ATS matching engine.
              </p>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedSkillCategory}
                onChange={(e) => setSelectedSkillCategory(e.target.value)}
              >
                <option value="programmingLanguages">Programming Languages</option>
                <option value="frameworks">Frameworks</option>
                <option value="databases">Databases</option>
                <option value="cloud">Cloud & DevOps</option>
                <option value="tools">Tools & Platforms</option>
                <option value="softSkills">Soft Skills</option>
                <option value="other">Other Competencies</option>
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Docker, TypeScript"
                style={{ width: '180px' }}
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Categories Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {[
              { key: 'programmingLanguages', label: 'Programming Languages' },
              { key: 'frameworks', label: 'Frameworks & Libraries' },
              { key: 'databases', label: 'Databases & Storage' },
              { key: 'cloud', label: 'Cloud Technologies & CI/CD' },
              { key: 'tools', label: 'Developer Tools' },
              { key: 'softSkills', label: 'Soft Skills & Methodologies' }
            ].map(cat => {
              const items = profile.skills?.[cat.key] || [];
              return (
                <div key={cat.key} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {cat.label} ({items.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {items.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No skills added in this category</span>
                    ) : (
                      items.map(skill => (
                        <span key={skill} className="badge badge-neutral" style={{ padding: '4px 8px', fontSize: '12px' }}>
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(cat.key, skill)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '4px' }}
                          >
                            ×
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
      )}

      {/* TAB 4: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Work Experience</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Add your real employment history. The AI will sharpen impact and action verbs without inventing claims.
              </p>
            </div>
            <button
              onClick={() => {
                const newExp = {
                  company: 'New Company',
                  role: 'Software Engineer',
                  location: 'Remote',
                  startDate: '2023-01',
                  endDate: 'Present',
                  currentlyWorking: true,
                  description: 'Engineered high-performance web features and RESTful APIs.',
                  achievements: ['Increased system performance by 25%'],
                  technologies: ['React', 'Node.js']
                };
                setProfile({ ...profile, experience: [newExp, ...(profile.experience || [])] });
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> Add Position
            </button>
          </div>

          {(profile.experience || []).map((exp, idx) => (
            <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                  Position #{idx + 1}
                </span>
                <button
                  onClick={() => {
                    const updated = profile.experience.filter((_, i) => i !== idx);
                    setProfile({ ...profile, experience: updated });
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 8px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Role / Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exp.role || ''}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[idx].role = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[idx].company = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2022-03"
                    value={exp.startDate || ''}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[idx].startDate = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Present"
                    value={exp.endDate || ''}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[idx].endDate = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Responsibilities & Scope</label>
                <textarea
                  className="form-textarea"
                  value={exp.description || ''}
                  onChange={(e) => {
                    const updated = [...profile.experience];
                    updated[idx].description = e.target.value;
                    setProfile({ ...profile, experience: updated });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Measurable Achievements (one per line)</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Reduced API latency by 35% through query optimization"
                  value={(exp.achievements || []).join('\n')}
                  onChange={(e) => {
                    const updated = [...profile.experience];
                    updated[idx].achievements = e.target.value.split('\n').filter(l => l.trim().length > 0);
                    setProfile({ ...profile, experience: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Projects & Open Source</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Highlight production, open-source, and personal software engineering projects.
              </p>
            </div>
            <button
              onClick={() => {
                const newProj = {
                  name: 'New Project',
                  role: 'Creator & Developer',
                  description: 'Engineered a full-stack platform supporting automated tasks.',
                  technologies: ['React', 'Node.js', 'MongoDB'],
                  githubUrl: 'https://github.com',
                  achievements: []
                };
                setProfile({ ...profile, projects: [newProj, ...(profile.projects || [])] });
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> Add Project
            </button>
          </div>

          {(profile.projects || []).map((proj, idx) => (
            <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                  Project #{idx + 1}: {proj.name}
                </span>
                <button
                  onClick={() => {
                    const updated = profile.projects.filter((_, i) => i !== idx);
                    setProfile({ ...profile, projects: updated });
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 8px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={proj.name || ''}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].name = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={proj.role || ''}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].role = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={proj.githubUrl || ''}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].githubUrl = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Live Demo URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={proj.projectUrl || ''}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].projectUrl = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Technologies Used (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React, Node.js, PostgreSQL, Docker"
                  value={(proj.technologies || []).join(', ')}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setProfile({ ...profile, projects: updated });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea
                  className="form-textarea"
                  value={proj.description || ''}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].description = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: EDUCATION */}
      {activeTab === 'education' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Education Credentials</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Academic qualifications, degrees, and relevant honors.
              </p>
            </div>
            <button
              onClick={() => {
                const newEdu = {
                  institution: 'University Name',
                  degree: 'Bachelor of Science',
                  field: 'Computer Science',
                  startDate: '2019',
                  endDate: '2023',
                  cgpa: '3.8 / 4.0',
                  description: 'Relevant coursework in software engineering, database systems, and algorithms.'
                };
                setProfile({ ...profile, education: [newEdu, ...(profile.education || [])] });
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> Add Education
            </button>
          </div>

          {(profile.education || []).map((edu, idx) => (
            <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                  Institution #{idx + 1}
                </span>
                <button
                  onClick={() => {
                    const updated = profile.education.filter((_, i) => i !== idx);
                    setProfile({ ...profile, education: updated });
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 8px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Institution / University</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx].institution = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Degree</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bachelor of Technology"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx].degree = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Field of Study</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science & Engineering"
                    value={edu.field || ''}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx].field = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CGPA / Grade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.cgpa || ''}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx].cgpa = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Certifications</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Industry certifications verified with authentic credential IDs or URLs.
              </p>
            </div>
            <button
              onClick={() => {
                const newCert = {
                  name: 'AWS Certified Solutions Architect',
                  issuer: 'Amazon Web Services',
                  date: '2023',
                  credentialUrl: 'https://aws.amazon.com'
                };
                setProfile({ ...profile, certifications: [newCert, ...(profile.certifications || [])] });
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> Add Certification
            </button>
          </div>

          {(profile.certifications || []).map((cert, idx) => (
            <div key={idx} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{cert.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {cert.issuer} • Issued {cert.date}
                </div>
              </div>
              <button
                onClick={() => {
                  const updated = profile.certifications.filter((_, i) => i !== idx);
                  setProfile({ ...profile, certifications: updated });
                }}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 8: LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Spoken Languages</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Language proficiencies</p>
            </div>
            <button
              onClick={() => {
                const newLang = { language: 'English', proficiency: 'Professional' };
                setProfile({ ...profile, languages: [newLang, ...(profile.languages || [])] });
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> Add Language
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {(profile.languages || []).map((lang, idx) => (
              <div key={idx} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{lang.language}</span>
                <span className="badge badge-info">{lang.proficiency}</span>
                <button
                  onClick={() => {
                    const updated = profile.languages.filter((_, i) => i !== idx);
                    setProfile({ ...profile, languages: updated });
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
