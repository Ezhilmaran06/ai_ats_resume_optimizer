import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Gauge,
  Compass,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Sliders,
  Layers,
  Award
} from 'lucide-react';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <ShieldCheck size={16} />
            <span>Guaranteed Zero AI Experience Fabrication</span>
          </div>

          <h1 className={styles.heroTitle}>
            Build Resumes That Match the Job.<br />
            <span className={styles.heroHighlight}>Powered by AI.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Create ATS-friendly resumes, analyze job descriptions, discover skill gaps, and tailor your resume for every job opportunity.
          </p>

          <div className={styles.heroActions}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Build My Resume
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Analyze a Job
              <Search size={18} />
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
              <div className={styles.heroStatNum}>30-90s</div>
              <div className={styles.heroStatLabel}>Interview Pitch Generators</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>End-to-End Workflow</div>
          <h2 className={styles.sectionTitle}>How ResumeAI Works</h2>
          <p className={styles.sectionSubtitle}>
            From verified profile to job-specific ATS-tailored resume in four transparent steps.
          </p>
        </div>

        <div className={styles.workflowGrid}>
          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>1</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Master Profile</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Create your verified source of truth: real skills, projects, verified education, and quantified work experience.
            </p>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>2</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>AI JD Analyzer</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Paste or upload any job description. AI extracts required languages, frameworks, cloud tools, and responsibilities.
            </p>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>3</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Matching & Tailoring</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              AI aligns your authentic achievements to target requirements. Review and accept suggestions before anything changes.
            </p>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.stepNum}>4</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600' }}>ATS Score & Export</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5' }}>
              Get a 7-part ATS compatibility breakdown, practice interview questions, and download as clean PDF or DOCX.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className={styles.section} style={{ backgroundColor: '#F8FAFC' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Engineered for Results</div>
          <h2 className={styles.sectionTitle}>Every Tool Needed for Modern Applications</h2>
          <p className={styles.sectionSubtitle}>
            A complete job optimization suite that prioritizes truthfulness and applicant control over keyword stuffing.
          </p>
        </div>

        <div className={styles.grid3}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Sparkles size={22} />
            </div>
            <h3 className={styles.featureTitle}>AI Resume Tailoring</h3>
            <p className={styles.featureDesc}>
              Tailors bullet points, reorders relevant sections, and highlights verified competencies to align directly with job criteria.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Gauge size={22} />
            </div>
            <h3 className={styles.featureTitle}>ATS Compatibility Analyzer</h3>
            <p className={styles.featureDesc}>
              Calculates a transparent score across 7 categories: Keyword Relevance, Skills Match, Job Relevance, Structure, Completeness, Readability, and Formatting.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Compass size={22} />
            </div>
            <h3 className={styles.featureTitle}>Skill Gap & Roadmaps</h3>
            <p className={styles.featureDesc}>
              Pinpoints missing requirements (Critical, Important, Nice-to-have) and generates realistic learning roadmaps with suggested projects.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Layers size={22} />
            </div>
            <h3 className={styles.featureTitle}>Resume Version Manager</h3>
            <p className={styles.featureDesc}>
              Keep separate tailored resumes for each target company. Visually diff changes against your Master Profile with one click.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <MessageSquare size={22} />
            </div>
            <h3 className={styles.featureTitle}>Interview Preparation</h3>
            <p className={styles.featureDesc}>
              Generates technical questions from the JD and project questions strictly grounded in your actual projects, plus 30s/60s/90s elevator pitches.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Sliders size={22} />
            </div>
            <h3 className={styles.featureTitle}>Application Pipeline Tracker</h3>
            <p className={styles.featureDesc}>
              Track status from Saved to Applied, Interview, and Offer. Connect which resume version was submitted with associated ATS score.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ANTI-FABRICATION PRINCIPLE */}
      <section id="anti-fabrication" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Ethical AI Policy</div>
          <h2 className={styles.sectionTitle}>The Anti-Fabrication Guarantee</h2>
          <p className={styles.sectionSubtitle}>
            Most AI tools hallucinate skills you don't have. ResumeAI strictly forbids it.
          </p>
        </div>

        <div className={styles.antiFabBanner}>
          <ShieldCheck size={40} color="#2563EB" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#0F172A' }}>
              We Never Fabricate User Experience
            </h3>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
              If a job posting requires a skill (such as AWS or Kubernetes) that is not in your verified Master Profile, ResumeAI flags it explicitly as <strong style={{ color: '#EF4444' }}>MISSING</strong>. We will NEVER silently invent tools, metrics, degrees, or companies. You stay in control of every suggestion.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Zero hallucinated job titles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Zero fake project metrics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>User reviews every bullet diff</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Verified profile source-of-truth</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEMPLATES PREVIEW */}
      <section id="templates" className={styles.section} style={{ backgroundColor: '#F8FAFC' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Machine-Parseable Layouts</div>
          <h2 className={styles.sectionTitle}>6 Professional ATS-Safe Templates</h2>
          <p className={styles.sectionSubtitle}>
            Designed to pass modern enterprise parsers (Workday, Greenhouse, Lever, Taleo) without graphic errors.
          </p>
        </div>

        <div className={styles.grid3}>
          {[
            { id: 'ats-classic', title: 'ATS Classic', desc: 'Standard single-column layout with clean standard headers. Guaranteed maximum machine parseability.', badge: 'ATS Safe' },
            { id: 'modern-pro', title: 'Modern Professional', desc: 'Crisp divider lines, balanced typography hierarchy, and subtle corporate styling.', badge: 'Popular' },
            { id: 'swe', title: 'Software Engineer', desc: 'Emphasizes technical skills, open-source repositories, and system architecture projects.', badge: 'Recommended' },
            { id: 'fresh-grad', title: 'Fresh Graduate', desc: 'Prioritizes academic credentials, coursework, coursework projects, and foundational competencies.', badge: 'Entry Level' },
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
                <span style={{ fontSize: '12px', color: '#64748B' }}>A4 PDF & DOCX ready</span>
                <Link to="/register" className="btn btn-outline btn-sm">Preview</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className={styles.section}>
        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>Ready to Build Your Winning Resume?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of software engineers, product managers, and professionals optimizing their resumes with confidence.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: '#2563EB', fontWeight: '700' }}>
              Get Started for Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
