import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileText,
  FileDown,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Printer,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import A4ResumeDocument from '../../components/resume/A4ResumeDocument';
import styles from './ResumeBuilderPage.module.css';

export default function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const printRef = useRef();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(0.85);

  // Accordion open states for section editor
  const [openSection, setOpenSection] = useState('personal');

  useEffect(() => {
    fetchOrCreateResume();
  }, [id]);

  const fetchOrCreateResume = async () => {
    try {
      setLoading(true);
      if (id) {
        const res = await api.get(`/resumes/${id}`);
        if (res.data.success) {
          setResume(res.data.data);
          return;
        }
      }

      // Check if user has an existing resume, else create one from master profile
      const listRes = await api.get('/resumes');
      if (listRes.data.success && listRes.data.data.length > 0) {
        setResume(listRes.data.data[0]);
        navigate(`/dashboard/builder/${listRes.data.data[0]._id}`, { replace: true });
      } else {
        const createRes = await api.post('/resumes', {
          title: 'Master Resume',
          templateId: 'ats-classic',
          fromMaster: true
        });
        if (createRes.data.success) {
          setResume(createRes.data.data);
          navigate(`/dashboard/builder/${createRes.data.data._id}`, { replace: true });
        }
      }
    } catch (err) {
      addToast('Failed to load resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resume) return;
    try {
      setSaving(true);
      const res = await api.put(`/resumes/${resume._id}`, {
        ...resume,
        saveSnapshot: true,
        snapshotNote: 'Manual save from builder'
      });
      if (res.data.success) {
        setResume(res.data.data);
        addToast('Resume changes saved!', 'success');
      }
    } catch (err) {
      addToast('Error saving resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportDocx = () => {
    if (!resume) return;
    window.open(`/api/resumes/${resume._id}/export/docx`, '_blank');
    addToast('Downloading ATS-formatted DOCX file...', 'info');
  };

  const handleExportTxt = () => {
    if (!resume) return;
    window.open(`/api/resumes/${resume._id}/export/txt`, '_blank');
    addToast('Downloading plain text resume...', 'info');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const toggleSection = (sec) => {
    setOpenSection(openSection === sec ? '' : sec);
  };

  if (loading || !resume) {
    return (
      <div style={{ display: 'flex', height: '600px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>Loading visual resume builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.builderContainer}>
      {/* 1. LEFT PANE: CONTENT SECTIONS & CONTROLS */}
      <div className={styles.leftPane}>
        <div className={styles.paneHeader}>
          <div className={styles.paneTitle}>Content & Sections</div>
          <input
            type="text"
            className="form-input"
            style={{ width: '180px', padding: '4px 8px', fontSize: '12px' }}
            value={resume.title || ''}
            onChange={(e) => setResume({ ...resume, title: e.target.value })}
            placeholder="Resume Title"
          />
        </div>

        <div className={styles.paneBody}>
          {/* Target Role & Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '11px' }}>Target Role</label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px' }}
                placeholder="Software Engineer"
                value={resume.targetRole || ''}
                onChange={(e) => setResume({ ...resume, targetRole: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '11px' }}>Target Company</label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px' }}
                placeholder="e.g. Google"
                value={resume.targetCompany || ''}
                onChange={(e) => setResume({ ...resume, targetCompany: e.target.value })}
              />
            </div>
          </div>

          {/* Section 1: Personal Info */}
          <div className={styles.sectionAccordion}>
            <div className={styles.accordionHeader} onClick={() => toggleSection('personal')}>
              <span>Personal & Contact Details</span>
              {openSection === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSection === 'personal' && (
              <div className={styles.accordionBody}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resume.personalInfo?.fullName || ''}
                    onChange={(e) => setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, fullName: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Professional Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resume.personalInfo?.professionalTitle || ''}
                    onChange={(e) => setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, professionalTitle: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={resume.personalInfo?.email || ''}
                    onChange={(e) => setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, email: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resume.personalInfo?.phone || ''}
                    onChange={(e) => setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resume.personalInfo?.location || ''}
                    onChange={(e) => setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, location: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Summary */}
          <div className={styles.sectionAccordion}>
            <div className={styles.accordionHeader} onClick={() => toggleSection('summary')}>
              <span>Professional Summary</span>
              {openSection === 'summary' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSection === 'summary' && (
              <div className={styles.accordionBody}>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '110px' }}
                  value={resume.summary || ''}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Section 3: Experience */}
          <div className={styles.sectionAccordion}>
            <div className={styles.accordionHeader} onClick={() => toggleSection('experience')}>
              <span>Work Experience ({resume.experience?.length || 0})</span>
              {openSection === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSection === 'experience' && (
              <div className={styles.accordionBody}>
                {(resume.experience || []).map((exp, idx) => (
                  <div key={idx} style={{ padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{exp.company || 'Company'}</span>
                      <button
                        onClick={() => {
                          const updated = resume.experience.filter((_, i) => i !== idx);
                          setResume({ ...resume, experience: updated });
                        }}
                        style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Role title"
                      value={exp.role || ''}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[idx].role = e.target.value;
                        setResume({ ...resume, experience: updated });
                      }}
                    />
                    <textarea
                      className="form-textarea"
                      placeholder="Role summary / scope"
                      value={exp.description || ''}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[idx].description = e.target.value;
                        setResume({ ...resume, experience: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Projects */}
          <div className={styles.sectionAccordion}>
            <div className={styles.accordionHeader} onClick={() => toggleSection('projects')}>
              <span>Key Projects ({resume.projects?.length || 0})</span>
              {openSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSection === 'projects' && (
              <div className={styles.accordionBody}>
                {(resume.projects || []).map((proj, idx) => (
                  <div key={idx} style={{ padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{proj.name || 'Project'}</span>
                      <button
                        onClick={() => {
                          const updated = resume.projects.filter((_, i) => i !== idx);
                          setResume({ ...resume, projects: updated });
                        }}
                        style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Technologies (comma separated)"
                      value={(proj.technologies || []).join(', ')}
                      onChange={(e) => {
                        const updated = [...resume.projects];
                        updated[idx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setResume({ ...resume, projects: updated });
                      }}
                    />
                    <textarea
                      className="form-textarea"
                      placeholder="Project achievements and scope"
                      value={proj.description || ''}
                      onChange={(e) => {
                        const updated = [...resume.projects];
                        updated[idx].description = e.target.value;
                        setResume({ ...resume, projects: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CENTER PANE: LIVE A4 PREVIEW & ZOOM CONTROLS */}
      <div className={styles.centerPane}>
        <div className={styles.centerToolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="btn btn-secondary btn-sm"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '45px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
              className="btn btn-secondary btn-sm"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="btn btn-secondary btn-sm"
              title="Fit to Screen"
            >
              <Maximize2 size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button onClick={handlePrintPdf} className="btn btn-secondary btn-sm" title="Print to PDF">
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        <div className={styles.previewScrollArea}>
          <A4ResumeDocument ref={printRef} resume={resume} scale={zoom} />
        </div>
      </div>

      {/* 3. RIGHT PANE: FORMATTING & TEMPLATE OPTIONS */}
      <div className={styles.rightPane}>
        <div className={styles.paneHeader}>
          <div className={styles.paneTitle}>Layout & Styling</div>
        </div>

        <div className={styles.paneBody}>
          {/* Template Selector */}
          <div className="form-group">
            <label className="form-label">Active Template</label>
            <select
              className="form-select"
              value={resume.templateId || 'ats-classic'}
              onChange={(e) => setResume({ ...resume, templateId: e.target.value })}
            >
              <option value="ats-classic">ATS Classic (Safe)</option>
              <option value="modern-pro">Modern Professional</option>
              <option value="swe">Software Engineer</option>
              <option value="fresh-grad">Fresh Graduate</option>
              <option value="minimal">Minimal (Safe)</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          {/* Font Family */}
          <div className="form-group">
            <label className="form-label">Font Family</label>
            <select
              className="form-select"
              value={resume.formatting?.fontFamily || 'Inter'}
              onChange={(e) => setResume({
                ...resume,
                formatting: { ...resume.formatting, fontFamily: e.target.value }
              })}
            >
              <option value="Inter">Inter (Clean Modern)</option>
              <option value="Georgia">Georgia (Serif Classic)</option>
              <option value="Arial">Arial (Standard Sans)</option>
              <option value="Garamond">Garamond (Executive Serif)</option>
            </select>
          </div>

          {/* Margins */}
          <div className="form-group">
            <label className="form-label">Page Margins</label>
            <select
              className="form-select"
              value={resume.formatting?.margins || 'normal'}
              onChange={(e) => setResume({
                ...resume,
                formatting: { ...resume.formatting, margins: e.target.value }
              })}
            >
              <option value="compact">Compact (0.5 in) — More Content</option>
              <option value="normal">Normal (0.75 in) — Balanced</option>
              <option value="spacious">Spacious (1.0 in) — Elegant</option>
            </select>
          </div>

          {/* Accent Color */}
          <div className="form-group">
            <label className="form-label">Accent Color</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#2563EB', '#0F172A', '#0D9488', '#4F46E5', '#DC2626'].map(color => (
                <div
                  key={color}
                  onClick={() => setResume({
                    ...resume,
                    formatting: { ...resume.formatting, accentColor: color }
                  })}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: resume.formatting?.accentColor === color ? '3px solid #93C5FD' : '1px solid #CBD5E1'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Downloads & Exports */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>EXPORT OPTIONS</span>
            <button onClick={handleExportDocx} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <FileDown size={16} />
              <span>Download ATS DOCX</span>
            </button>
            <button onClick={handleExportTxt} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <FileText size={16} />
              <span>Download Plain TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
