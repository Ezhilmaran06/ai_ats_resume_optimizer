const aiClient = require('./aiClient');
const { getAllUserSkills, evaluateSkillMatch } = require('../matching/matchingEngine');

/**
 * Validates a suggested text string against user verified profile data
 * Returns verification tag: 'SUPPORTED', 'PARTIALLY_SUPPORTED', or 'UNSUPPORTED'
 */
function validateAntiFabrication(suggestedText, originalText, verifiedSkills, userProfile) {
  const normSuggested = suggestedText.toLowerCase();

  // Find any new technical keywords introduced in the suggestion
  const commonTech = [
    'java', 'python', 'c++', 'c#', 'react', 'angular', 'vue', 'node.js', 'express',
    'spring boot', 'aws', 'docker', 'kubernetes', 'azure', 'gcp', 'mongodb', 'postgresql',
    'mysql', 'redis', 'graphql', 'rest api', 'ci/cd', 'git', 'kafka', 'hadoop'
  ];

  const introducedClaims = [];

  for (const tech of commonTech) {
    const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`\\b${escapedTech}\\b`, 'i');
    if (rx.test(normSuggested)) {
      const match = evaluateSkillMatch(tech, verifiedSkills);
      if (match.status === 'MISSING') {
        introducedClaims.push(tech);
      }
    }
  }

  if (introducedClaims.length > 0) {
    return {
      status: 'UNSUPPORTED',
      unsupportedClaims: introducedClaims,
      warning: `Suggestion references unverified skills (${introducedClaims.join(', ')}). In accordance with anti-fabrication rules, this is not added automatically.`
    };
  }

  // Check if it's an enhancement of existing text
  if (originalText && originalText.trim().length > 0) {
    return {
      status: 'SUPPORTED',
      unsupportedClaims: [],
      warning: null
    };
  }

  return {
    status: 'PARTIALLY_SUPPORTED',
    unsupportedClaims: [],
    warning: 'Please review and confirm this phrasing aligns with your actual experience.'
  };
}

/**
 * Generates tailored resume modifications based on Job Description while adhering strictly to Anti-Fabrication constraints
 */
async function optimizeResumeForJob(resume, job, jobAnalysis) {
  const verifiedSkills = getAllUserSkills(resume);
  const targetRole = job.role || jobAnalysis.extractedRole || 'Software Engineer';
  const targetCompany = job.company || jobAnalysis.extractedCompany || 'Target Company';

  const suggestions = [];

  // 1. Professional Summary enhancement
  const origSummary = resume.summary || '';
  let suggestedSummary = origSummary;

  // Enhance summary by emphasizing matching skills without inventing new ones
  const matchedCoreSkills = verifiedSkills.slice(0, 4);
  if (matchedCoreSkills.length > 0) {
    suggestedSummary = `Dedicated ${targetRole} with hands-on proficiency in ${matchedCoreSkills.join(', ')}. Demonstrated experience in developing scalable architectures, optimizing application performance, and delivering robust full-stack solutions tailored for modern software ecosystems.`;
  } else {
    suggestedSummary = `Results-oriented ${targetRole} committed to building high-quality, maintainable software and driving technical excellence across the full development lifecycle.`;
  }

  const summaryValidation = validateAntiFabrication(suggestedSummary, origSummary, verifiedSkills, resume);

  suggestions.push({
    id: 'summary-1',
    section: 'summary',
    itemIndex: null,
    field: 'summary',
    title: 'Professional Summary',
    original: origSummary,
    suggested: suggestedSummary,
    status: summaryValidation.status,
    warning: summaryValidation.warning,
    reason: `Tailored summary to directly highlight verified competencies (${matchedCoreSkills.join(', ')}) relevant to the ${targetRole} opening at ${targetCompany}.`,
    action: 'PENDING'
  });

  // 2. Experience descriptions enhancements (improve action verbs and quantifiable phrasing)
  const experienceList = resume.experience || [];
  experienceList.forEach((exp, idx) => {
    const origDesc = exp.description || '';
    if (origDesc.trim().length > 0) {
      let polished = origDesc;
      if (!polished.startsWith('Spearheaded') && !polished.startsWith('Engineered') && !polished.startsWith('Architected')) {
        polished = `Engineered and maintained core application workflows: ${origDesc.replace(/^[A-Z][a-z]+ed\s+/, '')}`;
      }

      const val = validateAntiFabrication(polished, origDesc, verifiedSkills, resume);
      suggestions.push({
        id: `exp-${idx}-desc`,
        section: 'experience',
        itemIndex: idx,
        field: 'description',
        title: `${exp.company} - ${exp.role}`,
        original: origDesc,
        suggested: polished,
        status: val.status,
        warning: val.warning,
        reason: 'Enhanced impact with strong action verb while preserving authentic project scope.',
        action: 'PENDING'
      });
    }

    // Achievements enhancement
    if (Array.isArray(exp.achievements)) {
      exp.achievements.forEach((ach, aIdx) => {
        if (ach && ach.trim().length > 0) {
          const polishedAch = ach.includes('%') || ach.includes('improved') || ach.includes('optimized')
            ? ach
            : `Delivered ${ach}, improving operational reliability and team development velocity.`;

          const val = validateAntiFabrication(polishedAch, ach, verifiedSkills, resume);
          suggestions.push({
            id: `exp-${idx}-ach-${aIdx}`,
            section: 'experience',
            itemIndex: idx,
            field: `achievements[${aIdx}]`,
            title: `${exp.company} - Bullet ${aIdx + 1}`,
            original: ach,
            suggested: polishedAch,
            status: val.status,
            warning: val.warning,
            reason: 'Strengthened phrasing to convey quantifiable business outcome without fabricating metrics.',
            action: 'PENDING'
          });
        }
      });
    }
  });

  // 3. Project descriptions enhancements
  const projectsList = resume.projects || [];
  projectsList.forEach((proj, idx) => {
    const origDesc = proj.description || '';
    if (origDesc.trim().length > 0) {
      const projTech = Array.isArray(proj.technologies) && proj.technologies.length > 0
        ? ` using ${proj.technologies.join(', ')}`
        : '';
      const polishedProj = `Developed ${proj.name}${projTech}: ${origDesc.replace(/^[A-Z][a-z]+ed\s+/, '')}`;

      const val = validateAntiFabrication(polishedProj, origDesc, verifiedSkills, resume);
      suggestions.push({
        id: `proj-${idx}-desc`,
        section: 'projects',
        itemIndex: idx,
        field: 'description',
        title: `Project: ${proj.name}`,
        original: origDesc,
        suggested: polishedProj,
        status: val.status,
        warning: val.warning,
        reason: `Explicitly contextualized technology stack (${proj.technologies?.join(', ') || 'core tools'}) directly within the description for ATS indexers.`,
        action: 'PENDING'
      });
    }
  });

  // 4. Skills reordering recommendation
  const requiredJobSkills = (jobAnalysis.requirementsTable || [])
    .filter(r => r.priority === 'Required')
    .map(r => r.name);

  const reorderedSkills = [...verifiedSkills].sort((a, b) => {
    const aMatch = evaluateSkillMatch(a, requiredJobSkills).status === 'MATCHED' ? 1 : 0;
    const bMatch = evaluateSkillMatch(b, requiredJobSkills).status === 'MATCHED' ? 1 : 0;
    return bMatch - aMatch;
  });

  suggestions.push({
    id: 'skills-reorder',
    section: 'skills',
    itemIndex: null,
    field: 'reorder',
    title: 'Skills Prioritization',
    original: verifiedSkills.slice(0, 8).join(', '),
    suggested: reorderedSkills.slice(0, 8).join(', '),
    status: 'SUPPORTED',
    warning: null,
    reason: 'Reordered verified skills so requirements explicitly demanded in the job description appear first.',
    action: 'PENDING'
  });

  // 5. Anti-Fabrication Missing Skills Notice
  const missingJobSkills = (jobAnalysis.requirementsTable || [])
    .filter(r => evaluateSkillMatch(r.name, verifiedSkills).status === 'MISSING')
    .slice(0, 5);

  const missingSkillsAlerts = missingJobSkills.map(req => ({
    skill: req.name,
    priority: req.priority,
    status: 'UNSUPPORTED',
    message: `The job demands ${req.name} (${req.priority}), but ${req.name} is not in your verified profile. In accordance with ResumeAI anti-fabrication rules, this skill was NOT added automatically.`
  }));

  return {
    targetRole,
    targetCompany,
    suggestions,
    missingSkillsAlerts,
    summaryStats: {
      totalSuggestions: suggestions.length,
      supportedCount: suggestions.filter(s => s.status === 'SUPPORTED').length,
      partiallySupportedCount: suggestions.filter(s => s.status === 'PARTIALLY_SUPPORTED').length,
      unsupportedCount: suggestions.filter(s => s.status === 'UNSUPPORTED').length
    }
  };
}

module.exports = { optimizeResumeForJob, validateAntiFabrication };
