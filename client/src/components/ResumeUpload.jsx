import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, FileCheck, FileCode } from 'lucide-react';

const ALLOWED_EXTS = ['.pdf', '.docx', '.doc', '.txt'];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ResumeUpload({ file, onFileChange, error, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const validateAndSet = (selectedFile) => {
    if (!selectedFile) return;

    const name = selectedFile.name.toLowerCase();
    const isAllowed = ALLOWED_EXTS.some(ext => name.endsWith(ext));
    if (!isAllowed) {
      onFileChange(null, 'Unsupported format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (selectedFile.size > MAX_BYTES) {
      onFileChange(null, 'File exceeds 10MB limit. Please upload a smaller resume.');
      return;
    }

    if (selectedFile.size === 0) {
      onFileChange(null, 'Selected file is empty. Please choose a valid document.');
      return;
    }

    onFileChange(selectedFile, null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSet(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSet(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = '';
    onFileChange(null, null);
  };

  const getFileIcon = (filename = '') => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText size={28} className="upload-file-icon text-red" />;
    if (ext === 'docx' || ext === 'doc') return <FileCheck size={28} className="upload-file-icon text-blue" />;
    return <FileCode size={28} className="upload-file-icon text-slate" />;
  };

  return (
    <div className="card input-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="icon-badge">
            <Upload size={18} />
          </div>
          <div>
            <h2 className="card-title">Upload Your Resume</h2>
            <p className="card-subtitle">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
          </div>
        </div>
      </div>

      <div className="card-body">
        <input
          ref={inputRef}
          type="file"
          id="resume-file-input"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {!file ? (
          <div
            id="resume-dropzone"
            className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${disabled ? 'dropzone-disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <div className="dropzone-icon-circle">
              <Upload size={28} />
            </div>
            <div className="dropzone-text">
              <p className="dropzone-primary-text">
                <span className="dropzone-link">Click to browse</span> or drag and drop your resume
              </p>
              <p className="dropzone-secondary-text">
                PDF, DOCX, or TXT (Plain text-searchable)
              </p>
            </div>
            <button
              type="button"
              id="choose-file-btn"
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={disabled}
            >
              Choose File
            </button>
          </div>
        ) : (
          <div className="file-preview-card">
            <div className="file-preview-left">
              {getFileIcon(file.name)}
              <div className="file-preview-meta">
                <span className="file-preview-name" title={file.name}>
                  {file.name}
                </span>
                <div className="file-preview-sub">
                  <span className="badge badge-subtle">
                    {file.name.split('.').pop().toUpperCase()}
                  </span>
                  <span className="file-preview-size">{formatBytes(file.size)}</span>
                  <span className="status-indicator status-ready">
                    <CheckCircle2 size={13} />
                    Ready for analysis
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              id="remove-resume-btn"
              className="btn-icon btn-remove"
              onClick={handleRemove}
              disabled={disabled}
              title="Remove file"
              aria-label="Remove uploaded resume"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="upload-error-msg" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
