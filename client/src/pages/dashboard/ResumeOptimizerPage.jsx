import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  Edit2,
  FileText,
  Briefcase,
  Layers,
  ArrowDown
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ResumeOptimizerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(searchParams.get('resumeId') || '');
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');

  const [matchingData, setMatchingData] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationPlan, setOptimizationPlan] = useState(null);
  const [decisions, setDecisions] = useState({}); // { [suggestionId]: 'ACCEPTED' | 'REJECTED' | 'EDITED' }
  const [editedTexts, setEditedTexts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchResumesAndJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      runMatchingAnalysis();
    }
  }, [selectedResumeId, selectedJobId]);

  const fetchResumesAndJobs = async () => {
    try {
      const [resRes, jobRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs')
      ]);
      if (resRes.data.success) {
        setResumes(resRes.data.data);
        if (!selectedResumeId && resRes.data.data.length > 0) {
          setSelectedResumeId(resRes.data.data[0]._id);
        }
      }
      if (jobRes.data.success) {
        setJobs(jobRes.data.data);
        if (!selectedJobId && jobRes.data.data.length > 0) {
          setSelectedJobId(jobRes.data.data[0]._id);
        }
      }
    } catch (err) {
      addToast('Failed to load resumes or jobs.', 'error');
    }
  };

  const runMatchingAnalysis = async () => {
    if (!selectedJobId) return;
    try {
      const res = await api.post('/matching/analyze', {
        resumeId: selectedResumeId || undefined,
        jobId: selectedJobId
      });
      if (res.data.success) {
        setMatchingData(res.data.data);
      }
    } catch (err) {
      console.error('Matching analysis failed:', err);
    }
  };

  const handleGenerateOptimization = async () => {
    if (!selectedResumeId || !selectedJobId) {
      addToast('Please select both a resume and a target job.', 'warning');
      return;
    }

    try {
      setOptimizing(true);
      const res = await api.post('/matching/optimize', {
        resumeId: selectedResumeId,
        jobId: selectedJobId
      });
      if (res.data.success) {
        setOptimizationPlan(res.data.data);
        // Initialize decisions as ACCEPTED by default for supported changes
        const initDecisions = {};
        const initTexts = {};
        res.data.data.suggestions.forEach(s => {
          initDecisions[s.id] = s.status === 'SUPPORTED' ? 'ACCEPTED' : 'PENDING';
          initTexts[s.id] = s.suggested;
        });
        setDecisions(initDecisions);
        setEditedTexts(initTexts);
        addToast('Tailored suggestions generated! Review each proposed change below.', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Optimization failed.', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  const handleAcceptAll = () => {
    const updated = { ...decisions };
    optimizationPlan?.suggestions?.forEach(s => {
      if (s.status !== 'UNSUPPORTED') {
        updated[s.id] = 'ACCEPTED';
      }
    });
    setDecisions(updated);
    addToast('Accepted all supported recommendations.', 'success');
  };

  const handleRejectAll = () => {
    const updated = { ...decisions };
    optimizationPlan?.suggestions?.forEach(s => {
      updated[s.id] = 'REJECTED';
    });
    setDecisions(updated);
    addToast('Rejected all suggestions.', 'info');
  };

  const handleApplyChanges = async () => {
    const acceptedList = (optimizationPlan?.suggestions || [])
      .filter(s => decisions[s.id] === 'ACCEPTED')
      .map(s => ({
        ...s,
        suggested: editedTexts[s.id] || s.suggested
      }));

    if (acceptedList.length === 0) {
      addToast('No accepted suggestions to apply.', 'warning');
      return;
    }

    try {
      setApplying(true);
      const res = await api.post('/matching/apply-suggestions', {
        resumeId: selectedResumeId,
        acceptedSuggestions: acceptedList
      });

      if (res.data.success) {
        addToast(`Applied ${acceptedList.length} verified improvements to resume!`, 'success');
        navigate(`/dashboard/builder/${selectedResumeId}`);
      }
    } catch (err) {
      addToast('Failed to apply suggestions to resume.', 'error');
    } finally {
      setApplying(false);
    }
  };

  // Job input state for Commit 19
  const [jobInputMode, setJobInputMode] = useState('new'); // 'new' | 'saved'
  const [jdFormat, setJdFormat] = useState('paste'); // 'paste' | 'upload'
  const [manualRole, setManualRole] = useState('Software Engineer');
  const [manualCompany, setManualCompany] = useState('');
  const [manualJobUrl, setManualJobUrl] = useState('');
  const [pastedJd, setPastedJd] = useState('');
  const [jobFile, setJobFile] = useState(null);
  const [analyzingJob, setAnalyzingJob] = useState(false);

  const handleJobFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['.pdf', '.docx', '.doc', '.txt'];
      const isAllowed = allowed.some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isAllowed) {
        addToast('Please upload a PDF, DOCX, or TXT file.', 'warning');
        return;
      }
      setJobFile(file);
      addToast(`Attached ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info');
    }
  };

  const handleAnalyzeAndSetJob = async (e) => {
    if (e) e.preventDefault();
    if (jdFormat === 'paste' && (!pastedJd || pastedJd.trim().length < 20)) {
      addToast('Please paste a job description (at least 20 characters).', 'warning');
      return;
    }
    if (jdFormat === 'upload' && !jobFile) {
      addToast('Please upload a PDF, DOCX, or TXT file containing the job description.', 'warning');
      return;
    }

    try {
      setAnalyzingJob(true);
      const formData = new FormData();
      formData.append('role', manualRole.trim() || 'Software Engineer');
      if (manualCompany.trim()) formData.append('company', manualCompany.trim());
      if (manualJobUrl.trim()) formData.append('jobUrl', manualJobUrl.trim());

      if (jdFormat === 'upload' && jobFile) {
        formData.append('jobFile', jobFile);
      } else {
        formData.append('rawText', pastedJd);
      }

      const res = await api.post('/jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const createdJob = res.data.data.job;
        setJobs(prev => [createdJob, ...prev.filter(j => j._id !== createdJob._id)]);
        setSelectedJobId(createdJob._id);
        addToast(`Target role "${createdJob.role}" loaded successfully!`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to process job description.', 'error');
    } finally {
      setAnalyzingJob(false);
    }
  };

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>Optimize for Role</h2>
            <span className="badge badge-success" style={{ gap: '4px' }}>
              <ShieldCheck size={14} /> Anti-Fabrication Engine
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Input target job description, analyze role requirements, and optimize your resume with strict factual integrity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedResumeId && (
            <Link to={`/dashboard/builder/${selectedResumeId}`} className="btn btn-secondary">
              <FileText size={16} />
              <span>Open in AI Resume Editor</span>
            </Link>
          )}
          <button
            onClick={handleGenerateOptimization}
            disabled={optimizing || !selectedResumeId || !selectedJobId}
            className="btn btn-primary"
          >
            <Sparkles size={16} />
            <span>{optimizing ? 'Analyzing & Tailoring...' : 'Optimize Resume for This Job'}</span>
          </button>
        </div>
      </div>

      {/* Step 1: Select Resume to Tailor */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700
          }}>1</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Select Your Resume</h3>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select
            className="form-select"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            style={{ fontWeight: 500 }}
          >
            {resumes.map(r => (
              <option key={r._id} value={r._id}>
                {r.title} ({r.templateId}) {r.targetCompany ? `• ${r.targetCompany}` : ''}
              </option>
            ))}
            {resumes.length === 0 && (
              <option value="">No resumes found. Please create or upload a resume first.</option>
            )}
          </select>
        </div>
      </div>

      {/* Step 2: Role & Job Description Input (Commit 19) */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700
            }}>2</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Target Role & Job Description</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Provide the job description by typing the role, pasting the text, or uploading a document (PDF, DOCX, TXT).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setJobInputMode('new')}
              className={`btn btn-sm ${jobInputMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '4px 12px' }}
            >
              Provide Job Description
            </button>
            <button
              type="button"
              onClick={() => setJobInputMode('saved')}
              className={`btn btn-sm ${jobInputMode === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '4px 12px' }}
            >
              Select Saved Role ({jobs.length})
            </button>
          </div>
        </div>

        {jobInputMode === 'saved' ? (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Choose from Previously Analyzed Roles</label>
            <select
              className="form-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {jobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.role} — {j.company} {j.createdAt ? `(${new Date(j.createdAt).toLocaleDateString()})` : ''}
                </option>
              ))}
              {jobs.length === 0 && (
                <option value="">No saved jobs yet. Switch to "Provide Job Description" above.</option>
              )}
            </select>
          </div>
        ) : (
          <form onSubmit={handleAnalyzeAndSetJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Primary & Optional Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  1. Target Role / Job Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Software Engineer"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CloudScale Technologies"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Posting URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://company.com/careers/role"
                  value={manualJobUrl}
                  onChange={(e) => setManualJobUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Input Type Selector: Paste vs Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Job Description Format:</span>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="jdFormat"
                    value="paste"
                    checked={jdFormat === 'paste'}
                    onChange={() => setJdFormat('paste')}
                  />
                  <span>Paste Job Description Text</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="jdFormat"
                    value="upload"
                    checked={jdFormat === 'upload'}
                    onChange={() => setJdFormat('upload')}
                  />
                  <span>Upload Document (PDF, DOCX, TXT)</span>
                </label>
              </div>

              {jdFormat === 'paste' ? (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '140px', fontSize: '13px', fontFamily: 'inherit' }}
                    placeholder="Paste the target job description, responsibilities, technical requirements, and qualifications here..."
                    value={pastedJd}
                    onChange={(e) => setPastedJd(e.target.value)}
                  />
                </div>
              ) : (
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleJobFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <FileText size={32} color="var(--primary)" />
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      {jobFile ? jobFile.name : 'Click or Drag & Drop Job Description Document'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Supports PDF, DOCX, and TXT files (up to 5 MB)
                    </div>
                    {jobFile && (
                      <span className="badge badge-success" style={{ marginTop: '4px' }}>
                        ✓ Ready: {(jobFile.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={analyzingJob}
                className="btn btn-primary"
                style={{ padding: '8px 20px' }}
              >
                <Sparkles size={16} />
                <span>{analyzingJob ? 'Processing Job Description...' : 'Analyze Role & Match Resume'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* AI ROLE ANALYSIS BREAKDOWN (Commit 20) */}
      {selectedJob && selectedJob.analysis && (
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                Role Analysis: {selectedJob.analysis.extractedRole || selectedJob.role}
              </h3>
              <span className="badge badge-info">{selectedJob.analysis.extractedCompany || selectedJob.company}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="badge badge-danger">
                {selectedJob.analysis.requiredSkills?.length || 0} Required
              </span>
              <span className="badge badge-primary">
                {selectedJob.analysis.preferredSkills?.length || 0} Preferred
              </span>
              {(selectedJob.analysis.optionalSkills?.length > 0) && (
                <span className="badge badge-neutral">
                  {selectedJob.analysis.optionalSkills.length} Optional
                </span>
              )}
            </div>
          </div>

          {/* Classified Requirements: Required vs Preferred vs Optional */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* Required */}
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Required Skills (Mandatory)</span>
                <span className="badge badge-danger" style={{ fontSize: '10px' }}>High Importance</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(selectedJob.analysis.requiredSkills || []).map((s, idx) => (
                  <span key={idx} className="badge badge-danger" style={{ fontSize: '12px' }}>
                    {typeof s === 'string' ? s : s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Preferred Skills (Plus)</span>
                <span className="badge badge-info" style={{ fontSize: '10px' }}>Medium Importance</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(selectedJob.analysis.preferredSkills || []).map((s, idx) => (
                  <span key={idx} className="badge badge-info" style={{ fontSize: '12px' }}>
                    {typeof s === 'string' ? s : s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Categorized Technical Architecture */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
            {selectedJob.analysis.programmingLanguages?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <strong>Languages:</strong> {selectedJob.analysis.programmingLanguages.join(', ')}
              </div>
            )}
            {selectedJob.analysis.frameworks?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <strong>Frameworks:</strong> {selectedJob.analysis.frameworks.join(', ')}
              </div>
            )}
            {selectedJob.analysis.databases?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <strong>Databases:</strong> {selectedJob.analysis.databases.join(', ')}
              </div>
            )}
            {selectedJob.analysis.cloudTechnologies?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <strong>Cloud / DevOps:</strong> {selectedJob.analysis.cloudTechnologies.join(', ')}
              </div>
            )}
            {selectedJob.analysis.tools?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <strong>Tools:</strong> {selectedJob.analysis.tools.join(', ')}
              </div>
            )}
            {selectedJob.analysis.softSkills?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <strong>Soft Skills:</strong> {selectedJob.analysis.softSkills.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Matching Breakdown Cards */}
      {matchingData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Overall Match Score</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
              {matchingData.matchPercentage}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {matchingData.summary?.matchedCount} Matched • {matchingData.summary?.partialCount} Partial • {matchingData.summary?.missingCount} Missing
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Found Keywords (Verified)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {(matchingData.keywords?.found || []).slice(0, 5).map((k, i) => (
                <span key={i} className="badge badge-success" style={{ fontSize: '11.5px' }}>✓ {k.keyword}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Missing Keywords</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {(matchingData.keywords?.missing || []).slice(0, 5).map((k, i) => (
                <span key={i} className="badge badge-danger" style={{ fontSize: '11.5px' }}>✕ {k.keyword}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANTI-FABRICATION MISSING SKILLS ALERTS */}
      {optimizationPlan?.missingSkillsAlerts?.length > 0 && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
            <AlertTriangle size={18} />
            <span>Anti-Fabrication Engine Notice: Missing Requirements Not Injected</span>
          </div>
          <p style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
            The target job requires the following skills, but they do not exist in your verified profile. In accordance with ResumeAI ethical rules, they have <strong>NOT</strong> been fabricated into your resume:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {optimizationPlan.missingSkillsAlerts.map((alert, i) => (
              <span key={i} className="badge badge-warning" style={{ fontSize: '12px' }}>
                {alert.skill} ({alert.priority})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI SUGGESTIONS REVIEW LIST */}
      {optimizationPlan && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>AI Suggested Enhancements</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Review each proposed modification. Accept, reject, or edit phrasing before applying to your resume.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAcceptAll} className="btn btn-secondary btn-sm">
                Accept All Supported
              </button>
              <button onClick={handleRejectAll} className="btn btn-secondary btn-sm">
                Reject All
              </button>
              <button onClick={handleApplyChanges} disabled={applying} className="btn btn-primary">
                {applying ? 'Applying Changes...' : 'Apply Accepted Changes'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Suggestions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {optimizationPlan.suggestions.map((item) => {
              const currentDecision = decisions[item.id] || 'PENDING';
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${item.status === 'SUPPORTED' ? 'var(--success)' : 'var(--warning)'}`,
                    borderRadius: '8px',
                    backgroundColor: currentDecision === 'REJECTED' ? '#F8FAFC' : '#FFFFFF',
                    opacity: currentDecision === 'REJECTED' ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <span className={`badge ${item.status === 'SUPPORTED' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Decision Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setDecisions({ ...decisions, [item.id]: 'ACCEPTED' })}
                        className={`btn btn-sm ${currentDecision === 'ACCEPTED' ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => setDecisions({ ...decisions, [item.id]: 'REJECTED' })}
                        className={`btn btn-sm ${currentDecision === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => setEditingId(isEditing ? null : item.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit2 size={14} /> {isEditing ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  {/* Explainable AI Reason */}
                  <div style={{ fontSize: '12.5px', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '6px 10px', borderRadius: '4px' }}>
                    <strong>Why:</strong> {item.reason}
                  </div>

                  {/* Original vs Suggested */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        ORIGINAL
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {item.original || '(Empty / Not specified)'}
                      </div>
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#ECFDF5', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>
                        SUGGESTED ENHANCEMENT
                      </div>
                      {isEditing ? (
                        <textarea
                          className="form-textarea"
                          style={{ fontSize: '13px' }}
                          value={editedTexts[item.id] || ''}
                          onChange={(e) => setEditedTexts({ ...editedTexts, [item.id]: e.target.value })}
                        />
                      ) : (
                        <div style={{ fontSize: '13px', color: '#065F46', lineHeight: '1.5', fontWeight: 500 }}>
                          {editedTexts[item.id] || item.suggested}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
