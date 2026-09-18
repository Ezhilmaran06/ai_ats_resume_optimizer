import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  MapPin,
  Link as LinkIcon
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function JobAnalyzerPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('requirements');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!rawText.trim() && !selectedFile) {
      addToast('Please paste a job description or upload a document file.', 'warning');
      return;
    }

    try {
      setAnalyzing(true);
      const formData = new FormData();
      if (selectedFile) {
        formData.append('jobFile', selectedFile);
      }
      formData.append('role', role);
      formData.append('company', company);
      formData.append('location', location);
      formData.append('jobUrl', jobUrl);
      formData.append('rawText', rawText);

      const res = await api.post('/jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAnalyzedResult(res.data.data);
        addToast('Job description successfully analyzed!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error analyzing job.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadDemoJob = async () => {
    try {
      setAnalyzing(true);
      const res = await api.post('/jobs/seed-demo');
      if (res.data.success) {
        setAnalyzedResult(res.data.data);
        setRole(res.data.data.job.role);
        setCompany(res.data.data.job.company);
        setRawText(res.data.data.job.rawText);
        addToast('Loaded sample Senior Full-Stack Engineer JD!', 'success');
      }
    } catch (err) {
      addToast('Error loading sample job.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Job Description Analyzer</h2>
            <span className="badge badge-info" style={{ gap: '4px' }}>
              <Sparkles size={12} /> AI Extraction
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Extract hard requirements, languages, frameworks, and qualifications from any job posting.
          </p>
        </div>

        <button onClick={handleLoadDemoJob} disabled={analyzing} className="btn btn-secondary">
          <Sparkles size={16} color="var(--primary)" />
          Load Sample Cloud Engineer JD
        </button>
      </div>

      {/* Input Section */}
      <div className="card">
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Target Role / Job Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Company</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CloudScale Technologies"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Remote</label>
              <input
                type="text"
                className="form-input"
                placeholder="San Francisco, CA / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Posting URL (optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://company.com/careers/role"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Paste or Upload */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Paste Job Description Text</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '160px', fontSize: '13px' }}
                placeholder="Paste the full job requirements, responsibilities, and qualifications here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Or Upload File (PDF/DOCX/TXT)</label>
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '20px 12px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '160px',
                cursor: 'pointer'
              }}>
                <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <span style={{ fontSize: '12.5px', fontWeight: '600' }}>
                  {selectedFile ? selectedFile.name : 'Choose Document'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PDF, DOCX, or TXT
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="btn btn-primary btn-lg"
            style={{ alignSelf: 'flex-start' }}
          >
            <Sparkles size={18} />
            <span>{analyzing ? 'Extracting & Structuring Requirements...' : 'Analyze Job Description'}</span>
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {analyzedResult && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                  {analyzedResult.analysis?.extractedRole || analyzedResult.job?.role}
                </h3>
                <span className="badge badge-info">{analyzedResult.analysis?.extractedCompany || analyzedResult.job?.company}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Extracted {(analyzedResult.analysis?.requirementsTable || []).length} technical & domain requirements.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate(`/dashboard/optimizer?jobId=${analyzedResult.job._id}`)}
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                Optimize Resume for This Job
              </button>
              <button
                onClick={() => navigate(`/dashboard/ats?jobId=${analyzedResult.job._id}`)}
                className="btn btn-secondary"
              >
                Check ATS Score
              </button>
            </div>
          </div>

          {/* Requirements Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            {['requirements', 'responsibilities', 'domain'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: activeTab === t ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* TAB 1: REQUIREMENTS TABLE */}
          {activeTab === 'requirements' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px' }}>Skill / Requirement</th>
                    <th style={{ padding: '10px 14px' }}>Category</th>
                    <th style={{ padding: '10px 14px' }}>Priority</th>
                    <th style={{ padding: '10px 14px' }}>Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {(analyzedResult.analysis?.requirementsTable || []).map((req, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {req.name}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {req.category}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${req.priority === 'Required' ? 'badge-danger' : 'badge-neutral'}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${req.importance === 'High' ? 'badge-warning' : 'badge-neutral'}`}>
                          {req.importance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: RESPONSIBILITIES */}
          {activeTab === 'responsibilities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(analyzedResult.analysis?.responsibilities || []).map((resp, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DOMAIN KEYWORDS & ACTION VERBS */}
          {activeTab === 'domain' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Action Verbs Extracted</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(analyzedResult.analysis?.actionVerbs || []).map((v, i) => (
                    <span key={i} className="badge badge-neutral">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Domain Keywords</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(analyzedResult.analysis?.domainKeywords || []).map((k, i) => (
                    <span key={i} className="badge badge-info">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
