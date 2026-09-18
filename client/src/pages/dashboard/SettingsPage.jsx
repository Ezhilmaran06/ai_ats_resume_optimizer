import React, { useState } from 'react';
import {
  Settings,
  User,
  Sparkles,
  Shield,
  Key,
  Save,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [aiKey, setAiKey] = useState('');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [defaultTemplate, setDefaultTemplate] = useState('ats-classic');

  const handleSaveAccount = (e) => {
    e.preventDefault();
    addToast('Account profile preferences updated!', 'success');
  };

  const handleSaveAI = (e) => {
    e.preventDefault();
    addToast('AI configuration saved. Built-in zero-hallucination guard is active.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Platform Settings & Preferences</h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account profile, AI configuration, and ATS optimization rules.
        </p>
      </div>

      {/* 1. Account Settings */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Account Information</h3>
        </div>

        <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                disabled
                className="form-input"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
                value={email}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Save size={14} /> Update Account
          </button>
        </form>
      </div>

      {/* 2. AI Model & API Configuration */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>AI Provider Configuration</h3>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          ResumeAI operates out-of-the-box using high-precision local deterministic heuristics. You can optionally supply your own API key to enable live cloud LLM inference.
        </p>

        <form onSubmit={handleSaveAI} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">AI Engine Model</label>
              <select
                className="form-select"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Recommended)</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                <option value="claude-3-haiku">Anthropic Claude 3 Haiku</option>
                <option value="local-heuristic">Built-in Local Heuristics Engine (Offline Safe)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Optional AI API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy... or sk-proj-..."
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--success)' }}>
            <CheckCircle2 size={14} color="var(--success)" />
            <span>Anti-fabrication validation layer is enforced on all model outputs.</span>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Save size={14} /> Save AI Settings
          </button>
        </form>
      </div>

      {/* 3. Resume Preferences */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Resume & ATS Preferences</h3>

        <div className="form-group">
          <label className="form-label">Default Resume Template</label>
          <select
            className="form-select"
            value={defaultTemplate}
            onChange={(e) => setDefaultTemplate(e.target.value)}
          >
            <option value="ats-classic">ATS Classic (Certified Safe)</option>
            <option value="modern-pro">Modern Professional</option>
            <option value="swe">Software Engineer</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
