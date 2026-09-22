import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import resumeApi from '../../services/resumeApi';
import { useToast } from '../../context/ToastContext';

export default function ResumeUploadModal({ isOpen, onClose, onSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(''); // 'uploading' | 'reading' | 'extracting'
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const validateFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return false;

    // Validate type
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const validMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const fileName = selectedFile.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMime = validMimes.includes(selectedFile.type);

    if (!hasValidExt && !hasValidMime) {
      setError('Invalid file type. Only PDF, DOCX, and TXT documents are allowed.');
      return false;
    }

    // Validate size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (selectedFile.size > MAX_SIZE) {
      setError('File size exceeds the 5MB limit. Please upload a smaller file.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (validateFile(dropped)) {
        setFile(dropped);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!validateFile(file)) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Uploading...
      setCurrentStep('Uploading...');
      setProgress(25);

      const formData = new FormData();
      formData.append('resumeFile', file);

      // Simulate step 2: Reading document...
      const readTimer = setTimeout(() => {
        setCurrentStep('Reading document...');
        setProgress(60);
      }, 500);

      // Simulate step 3: Extracting content...
      const extractTimer = setTimeout(() => {
        setCurrentStep('Extracting content...');
        setProgress(85);
      }, 1100);

      const uploadData = await resumeApi.uploadResume(formData);

      clearTimeout(readTimer);
      clearTimeout(extractTimer);

      setProgress(100);
      setCurrentStep('Complete!');

      addToast('Resume uploaded and extracted successfully!', 'success');

      const resumeId = uploadData?.resume?._id || uploadData?.data?.resume?._id || uploadData?.data?._id;

      if (onSuccess) {
        onSuccess(uploadData);
      } else if (resumeId) {
        navigate(`/dashboard/ats?resumeId=${resumeId}`);
      }

      onClose();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to upload and parse resume.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Upload Resume</h3>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: '1.4' }}>
          Upload your existing resume in <strong>PDF, DOCX, or TXT</strong> format. Our parser extracts all sections and generates an immediate ATS score.
        </p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12.5px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isProcessing ? (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '3px solid #2563EB',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {currentStep}
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Extracting candidate information, work chronology, and skills...
            </p>

            <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#2563EB',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
              {progress}%
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: dragActive ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
                backgroundColor: dragActive ? '#EFF6FF' : '#F8FAFC',
                borderRadius: '8px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <UploadCloud size={38} color={dragActive ? '#2563EB' : '#94A3B8'} style={{ margin: '0 auto 10px' }} />
              
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#16A34A', fontWeight: '600', fontSize: '14px' }}>
                  <CheckCircle size={18} />
                  <span>{file.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Click to browse or drag & drop file here
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Supported formats: PDF, DOCX, TXT (Maximum 5MB)
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B', marginBottom: '20px' }}>
              <ShieldCheck size={14} color="#16A34A" />
              <span>Private & secure: Document processed in memory, never exposed publicly.</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={!file} className="btn btn-primary">
                Upload & Parse
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
