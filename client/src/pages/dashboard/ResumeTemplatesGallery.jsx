import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check, FileText } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TEMPLATES_DATA = [
  {
    id: 'ats-classic',
    title: 'ATS Classic',
    category: 'Legacy & Modern ATS',
    badge: '100% ATS Compatible',
    isAtsSafe: true,
    font: 'Inter / Helvetica',
    margins: 'Normal (0.75in)',
    layout: 'Single Column Strict',
    description: 'Ultra-clean single-column hierarchy designed specifically for legacy enterprise parsers (Workday, Taleo, Brassring). Standard headings guaranteed zero parsing errors.',
    features: [
      'Standardized section headings',
      'No multi-column text containers',
      'Linear top-to-bottom reading path',
      'Bullet points parsed as list items'
    ]
  },
  {
    id: 'modern-pro',
    title: 'Modern Professional',
    category: 'Corporate & Tech',
    badge: '100% ATS Compatible',
    isAtsSafe: true,
    font: 'Inter / Arial',
    margins: 'Compact (0.5in)',
    layout: 'Single Column with Subtle Dividers',
    description: 'Crisp horizontal dividers with emphasized company and role titles. Balances high visual elegance with 100% machine parseability.',
    features: [
      'Subtle divider rules between sections',
      'Balanced margin density',
      'Emphasized role and date typography',
      'Compact skill badge rendering'
    ]
  },
  {
    id: 'swe',
    title: 'Software Engineer',
    category: 'Engineering & DevOps',
    badge: '100% ATS Compatible',
    isAtsSafe: true,
    font: 'Inter / Roboto Mono for tech',
    margins: 'Normal (0.75in)',
    layout: 'Engineering Focused',
    description: 'Tailored for software engineers, cloud architects, and data practitioners. Emphasizes technical stacks, GitHub repositories, and system metrics.',
    features: [
      'Technical skills categorized at top',
      'Project-centric bullet format',
      'Quantifiable impact highlights',
      'Links directly to GitHub & Live URLs'
    ]
  },
  {
    id: 'fresh-grad',
    title: 'Fresh Graduate',
    category: 'Entry-Level & Internships',
    badge: '100% ATS Compatible',
    isAtsSafe: true,
    font: 'Inter / Calibri',
    margins: 'Normal (0.75in)',
    layout: 'Education Prioritized',
    description: 'Positions academic accomplishments, university projects, GPA, and coursework prominently ahead of early career experiences.',
    features: [
      'Education section above experience',
      'Coursework and academic projects focus',
      'Foundational programming concepts',
      'Campus leadership and hackathons'
    ]
  },
  {
    id: 'minimal',
    title: 'Minimal',
    category: 'All Industries',
    badge: '100% ATS Compatible',
    isAtsSafe: true,
    font: 'Inter / Georgia',
    margins: 'Spacious (1in)',
    layout: 'Typography Driven',
    description: 'Maximized whitespace, elegant typographic contrast, and zero clutter. Perfect for recruiters scanning in 6 seconds.',
    features: [
      'High contrast black & slate typography',
      'Generous whitespace breathing room',
      'Zero decorative graphics',
      'Effortless text-stream extraction'
    ]
  },
  {
    id: 'executive',
    title: 'Executive',
    category: 'Management & Leadership',
    badge: '100% ATS Compatible',
    isAtsSafe: true,
    font: 'Inter / Garamond',
    margins: 'Normal (0.75in)',
    layout: 'Leadership Focused',
    description: 'Crafted for engineering managers, directors, and staff engineers. Emphasizes organizational strategy, team scaling, and business revenue impact.',
    features: [
      'Expanded strategic leadership summary',
      'Cross-functional team size metrics',
      'Budget and operational scope highlights',
      'High-impact executive phrasing'
    ]
  }
];

export default function ResumeTemplatesGallery() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSelectTemplate = async (templateId, templateTitle) => {
    try {
      const res = await api.post('/resumes', {
        title: `${templateTitle} Resume`,
        templateId,
        fromMaster: true
      });

      if (res.data.success) {
        addToast(`Created new resume using "${templateTitle}" template!`, 'success');
        navigate(`/dashboard/builder/${res.data.data._id}`);
      }
    } catch (err) {
      addToast('Error creating resume from template.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ATS-Friendly Resume Templates</h2>
            <span className="badge badge-success" style={{ gap: '4px' }}>
              <ShieldCheck size={14} /> 100% Machine-Parseable
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            All templates avoid embedded tables, graphics, headers/footers, and complex multi-column grids that confuse Applicant Tracking Systems.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {TEMPLATES_DATA.map((tmpl) => (
          <div
            key={tmpl.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              border: tmpl.id === 'ats-classic' ? '2px solid var(--primary)' : '1px solid var(--border-color)'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{tmpl.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tmpl.category}</span>
                </div>
                <span className="badge badge-success" style={{ gap: '4px' }}>
                  <ShieldCheck size={12} />
                  {tmpl.badge}
                </span>
              </div>

              {/* Minimal preview mockup box */}
              <div style={{
                height: '140px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ width: '40%', height: '8px', backgroundColor: '#CBD5E1', borderRadius: '4px' }} />
                <div style={{ width: '60%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
                <div style={{ width: '80%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                <div style={{ width: '90%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                <div style={{ width: '70%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                {tmpl.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                {tmpl.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <Check size={14} color="var(--success)" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectTemplate(tmpl.id, tmpl.title)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <span>Use This Template</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
