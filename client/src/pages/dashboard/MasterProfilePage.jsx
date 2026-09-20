import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EducationSection from '../../components/profile/EducationSection';
import SkillsSection from '../../components/profile/SkillsSection';
import ProjectsSection from '../../components/profile/ProjectsSection';
import ExperienceSection from '../../components/profile/ExperienceSection';
import CertificationsSection from '../../components/profile/CertificationsSection';
import AchievementsSection from '../../components/profile/AchievementsSection';
import LanguagesSection from '../../components/profile/LanguagesSection';
import LinksSection from '../../components/profile/LinksSection';

export default function MasterProfilePage() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improvingSummary, setImprovingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

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

      {/* 9 Master Profile Section Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'personal', label: 'Personal Information' },
          { id: 'education', label: 'Education' },
          { id: 'skills', label: 'Skills' },
          { id: 'experience', label: 'Experience' },
          { id: 'projects', label: 'Projects' },
          { id: 'certifications', label: 'Certifications' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'languages', label: 'Languages' },
          { id: 'links', label: 'Links' }
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
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

      {/* TAB 3: SKILLS */}
      {activeTab === 'skills' && (
        <SkillsSection
          skills={profile.skills}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 4: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <ExperienceSection
          experience={profile.experience}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 5: PROJECTS */}
      {activeTab === 'projects' && (
        <ProjectsSection
          projects={profile.projects}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 6: EDUCATION */}
      {activeTab === 'education' && (
        <EducationSection
          education={profile.education}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 7: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <CertificationsSection
          certifications={profile.certifications}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 8: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <AchievementsSection
          achievements={profile.achievements}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 9: LANGUAGES */}
      {activeTab === 'languages' && (
        <LanguagesSection
          languages={profile.languages}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* TAB 10: LINKS */}
      {activeTab === 'links' && (
        <LinksSection
          links={profile.links || profile.personalInfo?.otherLinks}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}
    </div>
  );
}
