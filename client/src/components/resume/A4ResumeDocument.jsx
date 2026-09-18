import React, { forwardRef } from 'react';
import styles from './A4ResumeDocument.module.css';

const A4ResumeDocument = forwardRef(({ resume, scale = 1 }, ref) => {
  if (!resume) return null;

  const {
    templateId = 'ats-classic',
    personalInfo = {},
    summary = '',
    experience = [],
    projects = [],
    skills = {},
    education = [],
    certifications = [],
    languages = [],
    formatting = {}
  } = resume;

  const {
    fontFamily = 'Inter',
    fontSize = '10pt',
    lineSpacing = '1.2',
    margins = 'normal',
    accentColor = '#2563EB'
  } = formatting;

  const marginClass = margins === 'compact'
    ? styles.marginsCompact
    : (margins === 'spacious' ? styles.marginsSpacious : styles.marginsNormal);

  const contactList = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin ? personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '') : '',
    personalInfo.github ? personalInfo.github.replace(/^https?:\/\/(www\.)?/, '') : '',
    personalInfo.portfolio ? personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '') : ''
  ].filter(Boolean);

  const skillCategories = [
    { label: 'Languages', items: skills.programmingLanguages },
    { label: 'Frameworks', items: skills.frameworks },
    { label: 'Databases', items: skills.databases },
    { label: 'Cloud & DevOps', items: skills.cloud },
    { label: 'Developer Tools', items: skills.tools },
    { label: 'Soft Skills', items: skills.softSkills }
  ].filter(c => Array.isArray(c.items) && c.items.length > 0);

  // Template-specific header styling
  const renderHeader = () => {
    if (templateId === 'modern-pro') {
      return (
        <header className={styles.modernHeader} style={{ borderColor: accentColor }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.01em' }}>
              {personalInfo.fullName || 'Candidate Name'}
            </h1>
            <div style={{ fontSize: '14px', fontWeight: '600', color: accentColor, marginTop: '2px' }}>
              {personalInfo.professionalTitle || 'Software Engineer'}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>
            {contactList.map((c, i) => (
              <div key={i}>{c}</div>
            ))}
          </div>
        </header>
      );
    }

    if (templateId === 'minimal') {
      return (
        <header className={styles.minimalHeader}>
          <h1 className={styles.minimalTitle}>
            {personalInfo.fullName || 'Candidate Name'}
          </h1>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginTop: '2px' }}>
            {personalInfo.professionalTitle || 'Software Engineer'}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '11.5px', color: '#475569', marginTop: '8px' }}>
            {contactList.join('  •  ')}
          </div>
        </header>
      );
    }

    // Default: ATS Classic & SWE
    return (
      <header className={styles.atsClassicHeader} style={{ borderColor: templateId === 'swe' ? accentColor : '#0F172A' }}>
        <h1 className={styles.atsName}>
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        <div className={styles.atsSubtitle} style={{ color: templateId === 'swe' ? accentColor : '#334155' }}>
          {personalInfo.professionalTitle || 'Software Engineer'}
        </div>
        <div className={styles.atsContactLine}>
          {contactList.map((item, idx) => (
            <span key={idx}>
              {item}
              {idx < contactList.length - 1 && <span style={{ marginLeft: '10px', color: '#CBD5E1' }}>|</span>}
            </span>
          ))}
        </div>
      </header>
    );
  };

  // Sections
  const renderSummary = () => {
    if (!summary) return null;
    return (
      <section style={{ marginBottom: '14px' }}>
        <h2 className={styles.sectionTitle} style={{ color: templateId === 'modern-pro' ? accentColor : '#0F172A' }}>
          Professional Summary
        </h2>
        <p style={{ fontSize: '12.5px', lineHeight: lineSpacing, color: '#334155' }}>
          {summary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (skillCategories.length === 0) return null;
    return (
      <section style={{ marginBottom: '14px' }}>
        <h2 className={styles.sectionTitle} style={{ color: templateId === 'modern-pro' ? accentColor : '#0F172A' }}>
          Technical Skills
        </h2>
        <div className={templateId === 'swe' ? styles.sweTechHighlight : ''}>
          {skillCategories.map((c, i) => (
            <div key={i} className={styles.skillRow}>
              <span className={styles.skillLabel}>{c.label}:</span>
              <span className={styles.skillValues}>{c.items.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <section style={{ marginBottom: '14px' }}>
        <h2 className={styles.sectionTitle} style={{ color: templateId === 'modern-pro' ? accentColor : '#0F172A' }}>
          Work Experience
        </h2>
        {experience.map((exp, i) => (
          <div key={i} className={styles.itemBlock}>
            <div className={styles.itemHeaderRow}>
              <div>
                <span className={styles.itemRole}>{exp.role}</span>
                <span className={styles.itemCompany}> — {exp.company}</span>
                {exp.location && <span style={{ fontSize: '11.5px', color: '#64748B' }}> ({exp.location})</span>}
              </div>
              <span className={styles.itemDate}>
                {[exp.startDate, exp.currentlyWorking ? 'Present' : exp.endDate].filter(Boolean).join(' - ')}
              </span>
            </div>

            {exp.description && (
              <p className={styles.itemDesc} style={{ lineHeight: lineSpacing }}>
                {exp.description}
              </p>
            )}

            {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
              <ul className={styles.bulletList}>
                {exp.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className={styles.bulletItem} style={{ lineHeight: lineSpacing }}>
                    {ach}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section style={{ marginBottom: '14px' }}>
        <h2 className={styles.sectionTitle} style={{ color: templateId === 'modern-pro' ? accentColor : '#0F172A' }}>
          Key Projects
        </h2>
        {projects.map((proj, i) => (
          <div key={i} className={styles.itemBlock}>
            <div className={styles.itemHeaderRow}>
              <div>
                <span className={styles.itemRole}>{proj.name}</span>
                {proj.technologies?.length > 0 && (
                  <span style={{ fontSize: '11.5px', color: '#64748B', fontStyle: 'italic' }}>
                    {' '}({proj.technologies.join(', ')})
                  </span>
                )}
              </div>
              {proj.githubUrl && (
                <span style={{ fontSize: '11.5px', color: accentColor }}>
                  {proj.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                </span>
              )}
            </div>

            {proj.description && (
              <p className={styles.itemDesc} style={{ lineHeight: lineSpacing }}>
                {proj.description}
              </p>
            )}

            {Array.isArray(proj.achievements) && proj.achievements.length > 0 && (
              <ul className={styles.bulletList}>
                {proj.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className={styles.bulletItem}>
                    {ach}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section style={{ marginBottom: '14px' }}>
        <h2 className={styles.sectionTitle} style={{ color: templateId === 'modern-pro' ? accentColor : '#0F172A' }}>
          Education
        </h2>
        {education.map((edu, i) => (
          <div key={i} className={styles.itemBlock}>
            <div className={styles.itemHeaderRow}>
              <div>
                <span className={styles.itemRole}>{edu.degree} in {edu.field}</span>
                <span className={styles.itemCompany}> — {edu.institution}</span>
              </div>
              <span className={styles.itemDate}>
                {[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}
              </span>
            </div>
            {edu.cgpa && <div style={{ fontSize: '11.5px', color: '#64748B' }}>CGPA: {edu.cgpa}</div>}
          </div>
        ))}
      </section>
    );
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return null;
    return (
      <section style={{ marginBottom: '14px' }}>
        <h2 className={styles.sectionTitle} style={{ color: templateId === 'modern-pro' ? accentColor : '#0F172A' }}>
          Certifications
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
          {certifications.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600' }}>{c.name} — <span style={{ fontWeight: '400', color: '#64748B' }}>{c.issuer}</span></span>
              <span style={{ color: '#64748B' }}>{c.date}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div
      ref={ref}
      id="resume-a4-document"
      className={`${styles.a4Sheet} ${marginClass}`}
      style={{
        fontFamily,
        transform: `scale(${scale})`
      }}
    >
      {renderHeader()}
      {renderSummary()}
      {templateId === 'swe' ? (
        <>
          {renderSkills()}
          {renderExperience()}
          {renderProjects()}
          {renderEducation()}
          {renderCertifications()}
        </>
      ) : templateId === 'fresh-grad' ? (
        <>
          {renderEducation()}
          {renderSkills()}
          {renderProjects()}
          {renderExperience()}
          {renderCertifications()}
        </>
      ) : (
        <>
          {renderExperience()}
          {renderProjects()}
          {renderSkills()}
          {renderEducation()}
          {renderCertifications()}
        </>
      )}
    </div>
  );
});

export default A4ResumeDocument;
