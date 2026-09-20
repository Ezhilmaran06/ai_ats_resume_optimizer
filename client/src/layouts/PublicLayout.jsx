import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './PublicLayout.module.css';

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.publicContainer}>
      {/* SaaS Navigation Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <FileText size={20} />
            </div>
            <span>ResumeAI</span>
          </Link>

          <nav className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#ats-analysis" className={styles.navLink}>ATS Analysis</a>
            <a href="#ai-optimization" className={styles.navLink}>AI Optimization</a>
            <a href="#role-matching" className={styles.navLink}>Role Matching</a>
            <a href="#templates" className={styles.navLink}>Templates</a>
          </nav>

          <div className={styles.authButtons}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Upload Resume
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content (Landing, Login, Register) */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* SaaS Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.logo} style={{ color: '#FFFFFF', marginBottom: '16px' }}>
                <div className={styles.logoIcon}>
                  <FileText size={20} />
                </div>
                <span>ResumeAI</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.6', maxWidth: '320px', marginBottom: '16px' }}>
                AI ATS Resume Optimizer — Analyze compatibility, close role-specific gaps, and optimize your resume for automated screening with zero fabrication.
              </p>
              <div className="badge badge-success" style={{ gap: '6px' }}>
                <ShieldCheck size={14} />
                <span>Anti-Fabrication Engine Active</span>
              </div>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>ATS Optimization</h4>
              <ul className={styles.footerColList}>
                <li><a href="#ats-analysis">ATS Score Analyzer</a></li>
                <li><a href="#ai-optimization">AI Resume Optimizer</a></li>
                <li><a href="#role-matching">Role Gap Detection</a></li>
                <li><a href="#templates">ATS-Safe Templates</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Standards</h4>
              <ul className={styles.footerColList}>
                <li><a href="#ats-analysis">7-Factor ATS Rubric</a></li>
                <li><a href="#ai-optimization">Zero-Fabrication Policy</a></li>
                <li><a href="#templates">Parser Compliance</a></li>
                <li><Link to="/register">Candidate Registration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Account</h4>
              <ul className={styles.footerColList}>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div>© {new Date().getFullYear()} ResumeAI ATS Optimizer. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
