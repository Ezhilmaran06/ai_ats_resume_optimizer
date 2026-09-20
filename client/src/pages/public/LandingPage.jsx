import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Gauge,
  Compass,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  Layers,
  FileCheck,
  Sliders,
  Award,
  Zap,
  Check
} from 'lucide-react';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div>
      {/* 1. HERO SECTION */}
      <section id="hero" className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <ShieldCheck size={16} />
            <span>AI ATS Resume Optimizer</span>
          </div>

          <h1 className={styles.heroTitle}>
            Optimize Your Resume for Every Job.
          </h1>

          <p className={styles.heroSubtitle}>
            Analyze your resume, measure ATS compatibility, identify role-specific gaps, and improve your resume with AI.
          </p>

          <div className={styles.heroActions}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <Upload size={18} />
              <span>Upload Resume</span>
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              <Sparkles size={18} />
              <span>Optimize for a Role</span>
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStatItem}>
              <div className={styles.heroStatNum}>100%</div>
              <div className={styles.heroStatLabel}>Fact-Checked & Anti-Fabricated</div>
            </div>
            <div className={styles.heroStatItem}>
              <div className={styles.heroStatNum}>7-Part</div>
              <div className={styles.heroStatLabel}>Transparent ATS Scoring Rubric</div>
            </div>
            <div className={styles.heroStatItem}>
              <div className={styles.heroStatNum}>6+</div>
              <div className={styles.heroStatLabel}>ATS-Safe Clean Templates</div>
            </div>
            <div className={styles.heroStatItem}>
              <div className={styles.heroStatNum}>0%</div>
              <div className={styles.heroStatLabel}>Hallucinated Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Streamlined Workflow</div>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            A transparent 4-step process to optimize your resume for automated applicant tracking systems.
          </p>
        </div>

        <div className={styles.workflowGrid}>
          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>1</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Upload Resume</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Upload your existing PDF or DOCX resume, or initialize your verified Master Profile as your single source of truth.
            </p>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>2</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>ATS Score & Role Analysis</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Get an instant 7-part ATS compatibility breakdown and paste your target job description to extract core competencies.
            </p>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>3</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>AI Resume Optimization</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Align verified bullet points with target requirements using AI suggestions that never hallucinate fake experience.
            </p>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>4</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Final Score & Download</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Review your improved ATS score, verify formatting compliance, and download clean, machine-parseable PDF or DOCX files.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ATS ANALYSIS */}
      <section id="ats-analysis" className={styles.section} style={{ backgroundColor: '#F8FAFC' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Deep Machine Readability</div>
          <h2 className={styles.sectionTitle}>Comprehensive ATS Analysis</h2>
          <p className={styles.sectionSubtitle}>
            Simulate how enterprise applicant tracking systems (Workday, Greenhouse, Lever, Taleo) evaluate your resume.
          </p>
        </div>

        <div className={styles.grid3}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Gauge size={22} />
            </div>
            <h3 className={styles.featureTitle}>7-Factor ATS Rubric</h3>
            <p className={styles.featureDesc}>
              Detailed scoring across Keyword Relevance, Skills Match, Role Alignment, Section Structure, Profile Completeness, Readability, and Formatting.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FileCheck size={22} />
            </div>
            <h3 className={styles.featureTitle}>Section Header Parsing</h3>
            <p className={styles.featureDesc}>
              Validates that standard section headings (Experience, Education, Skills, Projects) are recognized cleanly by automated document parsers.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={22} />
            </div>
            <h3 className={styles.featureTitle}>Action Verb & Impact Audit</h3>
            <p className={styles.featureDesc}>
              Identifies weak or passive phrasing and suggests high-impact action verbs and quantified metric structures for maximum recruiter appeal.
            </p>
          </div>
        </div>
      </section>

      {/* 4. AI RESUME OPTIMIZATION */}
      <section id="ai-optimization" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Ethical AI Engine</div>
          <h2 className={styles.sectionTitle}>AI Resume Optimization</h2>
          <p className={styles.sectionSubtitle}>
            Enhance your bullet points and professional summary without hallucinating skills or companies you never had.
          </p>
        </div>

        <div className={styles.antiFabBanner}>
          <ShieldCheck size={40} color="#2563EB" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#0F172A' }}>
              Zero AI Experience Fabrication
            </h3>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
              Unlike generic AI tools that invent fake credentials, our optimizer uses your verified Master Profile as ground truth. We highlight missing keywords honestly and only suggest truthful bullet improvements based on your real experience.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Zero hallucinated skills or tools</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Zero fabricated metrics or roles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Side-by-side diff review for every change</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Full applicant ownership & control</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROLE MATCHING */}
      <section id="role-matching" className={styles.section} style={{ backgroundColor: '#F8FAFC' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Job-Specific Alignment</div>
          <h2 className={styles.sectionTitle}>Role Matching & Gap Detection</h2>
          <p className={styles.sectionSubtitle}>
            Compare your resume directly against any target role to uncover critical keyword and qualification gaps.
          </p>
        </div>

        <div className={styles.grid3}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Compass size={22} />
            </div>
            <h3 className={styles.featureTitle}>Skill & Keyword Mapping</h3>
            <p className={styles.featureDesc}>
              Instantly maps required skills from the job description against your verified resume competencies to reveal exact alignment.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Sliders size={22} />
            </div>
            <h3 className={styles.featureTitle}>Missing Gap Categorization</h3>
            <p className={styles.featureDesc}>
              Separates gaps into Critical, Important, and Nice-to-Have so you know exactly which verified experiences to highlight.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Layers size={22} />
            </div>
            <h3 className={styles.featureTitle}>Tailored Resume Versions</h3>
            <p className={styles.featureDesc}>
              Create and manage distinct tailored versions of your resume for different roles while keeping your Master Profile synchronized.
            </p>
          </div>
        </div>
      </section>

      {/* 6. RESUME TEMPLATES */}
      <section id="templates" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>ATS-Safe Layouts</div>
          <h2 className={styles.sectionTitle}>Machine-Parseable Resume Templates</h2>
          <p className={styles.sectionSubtitle}>
            Single-column, cleanly structured templates engineered to pass ATS parsers without formatting glitches or lost text.
          </p>
        </div>

        <div className={styles.grid3}>
          {[
            { id: 'ats-classic', title: 'ATS Classic', desc: 'Standard single-column layout with clean standard headers. Guaranteed maximum machine parseability.', badge: 'ATS Safe' },
            { id: 'modern-pro', title: 'Modern Professional', desc: 'Crisp divider lines, balanced typography hierarchy, and subtle corporate styling.', badge: 'Popular' },
            { id: 'swe', title: 'Software Engineer', desc: 'Emphasizes technical skills, programming languages, and system architecture projects.', badge: 'Recommended' },
            { id: 'fresh-grad', title: 'Fresh Graduate', desc: 'Prioritizes academic credentials, coursework projects, and foundational competencies.', badge: 'Entry Level' },
            { id: 'minimal', title: 'Minimal', desc: 'Ultra-clean typographic layout maximizing whitespace and quick recruiter readability.', badge: 'ATS Safe' },
            { id: 'executive', title: 'Executive', desc: 'Focuses on strategic leadership, cross-functional organizational impact, and business outcomes.', badge: 'Senior' }
          ].map(t => (
            <div key={t.id} className={styles.featureCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t.title}</h3>
                  <span className="badge badge-success">{t.badge}</span>
                </div>
                <p className={styles.featureDesc}>{t.desc}</p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>PDF & DOCX compliant</span>
                <Link to="/register" className="btn btn-outline btn-sm">Use Template</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className={styles.section}>
        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>Ready to Optimize Your Resume for ATS Success?</h2>
          <p className={styles.ctaSubtitle}>
            Analyze your resume, identify gaps for your target role, and optimize your content with AI precision today.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: '#2563EB', fontWeight: '700' }}>
              <Upload size={18} />
              <span>Upload Resume</span>
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}>
              <Sparkles size={18} />
              <span>Optimize for a Role</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

