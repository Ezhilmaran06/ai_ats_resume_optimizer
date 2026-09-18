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
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#ats-engine" className={styles.navLink}>ATS Compatibility</a>
            <a href="#templates" className={styles.navLink}>Templates</a>
            <a href="#anti-fabrication" className={styles.navLink}>Zero-Fabrication</a>
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
                  Build My Resume
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
                The ethical AI-powered ATS resume builder and job tailoring platform. Create once. Tailor for every job. Apply with confidence.
              </p>
              <div className="badge badge-success" style={{ gap: '6px' }}>
                <ShieldCheck size={14} />
                <span>Anti-Fabrication Engine Active</span>
              </div>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Product</h4>
              <ul className={styles.footerColList}>
                <li><a href="#features">AI Job Matching</a></li>
                <li><a href="#ats-engine">ATS Analyzer</a></li>
                <li><a href="#templates">ATS-Safe Templates</a></li>
                <li><a href="#how-it-works">Skill Gap Analysis</a></li>
                <li><a href="#interview">Interview Prep</a></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Resources</h4>
              <ul className={styles.footerColList}>
                <li><a href="#ats-engine">ATS Scoring Rubric</a></li>
                <li><a href="#anti-fabrication">Anti-Fabrication Rules</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#careers">Career Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Account</h4>
              <ul className={styles.footerColList}>
                <li><Link to="/login">Candidate Login</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div>© {new Date().getFullYear()} ResumeAI Platform. All rights reserved.</div>
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
