import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Welcome back! Successfully logged in.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // One-click quick demo login/registration for immediate reviewer testing
  const handleQuickDemo = async () => {
    setLoading(true);
    setError('');
    const demoEmail = 'alex.morgan@resumeai.io';
    const demoPassword = 'DemoPassword123!';

    try {
      // Try login first
      await login(demoEmail, demoPassword);
      addToast('Logged into Demo Account!', 'success');
      navigate('/dashboard');
    } catch (err) {
      // If demo user does not exist yet in DB, automatically register it!
      try {
        await register('Alex Morgan', demoEmail, demoPassword, demoPassword);
        addToast('Created and logged into Demo Account!', 'success');
        navigate('/dashboard');
      } catch (regErr) {
        setError(regErr.response?.data?.message || 'Could not initialize demo account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <FileText size={24} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>Log in to ResumeAI</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Access your resumes, ATS analyses, and tailored applications
          </p>
        </div>

        {/* Quick Demo Autofill Box */}
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--info-border)',
          borderRadius: '8px',
          padding: '14px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
            <Sparkles size={16} />
            <span>Instant Evaluation Mode</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Testing or reviewing the application? Click below to instantly sign in with a pre-configured Software Engineer account.
          </p>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: '4px' }}
          >
            {loading ? 'Signing In...' : 'Sign in as Demo User (1-Click)'}
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: '6px',
            color: 'var(--danger)',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
