/**
 * Defensive Normalization Utilities for AI ATS Resume Optimizer
 * Ensures that API responses are always structurally sound, preventing runtime
 * errors such as "((intermediate value) || []).filter is not a function".
 */

/**
 * Safely guarantee a value is an array
 */
export function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === 'string') {
    return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }
  if (typeof val === 'object') {
    return Object.values(val).flatMap(v => (Array.isArray(v) ? v : [v])).filter(Boolean);
  }
  return [val];
}

/**
 * Normalize resume object ensuring all expected sections and arrays exist
 */
export function normalizeResumeData(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      _id: '',
      title: 'Untitled Resume',
      templateId: 'ats-classic',
      personalInfo: {},
      summary: '',
      skills: {
        programmingLanguages: [],
        frameworks: [],
        databases: [],
        cloud: [],
        tools: [],
        softSkills: [],
        other: []
      },
      skillsList: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      links: [],
      atsScore: { overallScore: 0, categories: {}, issues: [], strengths: [] }
    };
  }

  const res = raw.resume || raw.data?.resume || raw.data || raw;

  // Handle skills: can be categorized object or flat array or both
  const rawSkills = res.skills || {};
  let skillsCategories = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    cloud: [],
    tools: [],
    softSkills: [],
    other: []
  };
  let skillsList = [];

  if (Array.isArray(rawSkills)) {
    skillsList = rawSkills.map(s => (typeof s === 'string' ? s : s.name || '')).filter(Boolean);
    // Group into categories heuristically if flat
    rawSkills.forEach(item => {
      const name = typeof item === 'string' ? item : item.name || '';
      const cat = typeof item === 'object' ? (item.category || '').toLowerCase() : '';
      if (!name) return;

      if (cat.includes('program') || cat.includes('language')) {
        skillsCategories.programmingLanguages.push(name);
      } else if (cat.includes('framework')) {
        skillsCategories.frameworks.push(name);
      } else if (cat.includes('data')) {
        skillsCategories.databases.push(name);
      } else if (cat.includes('cloud') || cat.includes('devops')) {
        skillsCategories.cloud.push(name);
      } else if (cat.includes('tool')) {
        skillsCategories.tools.push(name);
      } else if (cat.includes('soft')) {
        skillsCategories.softSkills.push(name);
      } else {
        skillsCategories.other.push(name);
      }
    });
  } else if (typeof rawSkills === 'object') {
    for (const key of Object.keys(skillsCategories)) {
      skillsCategories[key] = ensureArray(rawSkills[key]).map(s => (typeof s === 'string' ? s : s.name || '')).filter(Boolean);
    }
    skillsList = Array.from(new Set(Object.values(skillsCategories).flat()));
  }

  return {
    ...res,
    _id: res._id || res.id || '',
    title: res.title || 'Untitled Resume',
    templateId: res.templateId || 'ats-classic',
    personalInfo: res.personalInfo || res.personal || {},
    summary: typeof res.summary === 'string' ? res.summary : '',
    skills: skillsCategories,
    skillsCategories,
    skillsList,
    education: ensureArray(res.education),
    experience: ensureArray(res.experience),
    projects: ensureArray(res.projects),
    certifications: ensureArray(res.certifications),
    achievements: ensureArray(res.achievements),
    languages: ensureArray(res.languages),
    links: ensureArray(res.links || res.personalInfo?.otherLinks),
    atsScore: normalizeATSData(res.atsScore || raw.baselineAts || raw.ats)
  };
}

/**
 * Normalize ATS report data
 */
export function normalizeATSData(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      overallScore: 0,
      score: 0,
      displayScore: '0 / 100',
      label: 'ATS Compatibility Score',
      categories: {
        structure: 8,
        sectionCompleteness: 8,
        readability: 8,
        keywordQuality: 16,
        contentQuality: 14,
        formatting: 8
      },
      categoryScores: {},
      issues: [],
      strengths: [],
      suggestions: []
    };
  }

  const scoreVal = typeof raw.overallScore === 'number' ? raw.overallScore : (typeof raw.score === 'number' ? raw.score : 0);

  return {
    ...raw,
    overallScore: scoreVal,
    score: scoreVal,
    displayScore: raw.displayScore || `${scoreVal} / 100`,
    label: raw.label || 'ATS Compatibility Score',
    categories: raw.categories || {},
    categoryScores: raw.categoryScores || raw.breakdown || {},
    issues: ensureArray(raw.issues),
    strengths: ensureArray(raw.strengths),
    suggestions: ensureArray(raw.suggestions),
    warnings: ensureArray(raw.warnings)
  };
}

/**
 * Normalize role analysis data
 */
export function normalizeRoleData(raw) {
  const role = raw?.role || raw?.data || raw || {};
  return {
    title: role.title || role.jobTitle || role.role || 'Software Engineer',
    company: role.company || '',
    requiredSkills: ensureArray(role.requiredSkills),
    preferredSkills: ensureArray(role.preferredSkills),
    technicalSkills: ensureArray(role.technicalSkills || role.extractedSkills),
    softSkills: ensureArray(role.softSkills),
    responsibilities: ensureArray(role.responsibilities),
    keywords: ensureArray(role.keywords),
    education: ensureArray(role.education),
    experience: ensureArray(role.experience)
  };
}

/**
 * Normalize match analysis data
 */
export function normalizeMatchData(raw) {
  const match = raw?.match || raw?.data || raw || {};
  return {
    score: typeof match.score === 'number' ? match.score : (match.matchPercentage || 0),
    matchPercentage: typeof match.score === 'number' ? match.score : (match.matchPercentage || 0),
    matched: ensureArray(match.matched || match.matchedSkills),
    matchedSkills: ensureArray(match.matched || match.matchedSkills),
    partial: ensureArray(match.partial || match.partialSkills),
    partialSkills: ensureArray(match.partial || match.partialSkills),
    missing: ensureArray(match.missing || match.missingSkills),
    missingSkills: ensureArray(match.missing || match.missingSkills),
    recommendations: ensureArray(match.recommendations),
    explanations: match.explanations || {}
  };
}
