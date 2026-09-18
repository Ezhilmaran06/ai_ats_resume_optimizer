/**
 * Semantic synonym mappings for tech terms
 */
const SYNONYMS = {
  'restful apis': ['rest api', 'rest apis', 'restful services', 'restful web services', 'rest'],
  'rest api': ['restful api', 'restful apis', 'restful services', 'rest', 'api development'],
  'react': ['react.js', 'reactjs'],
  'react.js': ['react', 'reactjs'],
  'node.js': ['node', 'nodejs'],
  'node': ['node.js', 'nodejs'],
  'express': ['express.js', 'expressjs'],
  'express.js': ['express', 'expressjs'],
  'mongo': ['mongodb'],
  'mongodb': ['mongo', 'nosql'],
  'postgres': ['postgresql', 'psql'],
  'postgresql': ['postgres', 'psql'],
  'aws': ['amazon web services', 'amazon aws'],
  'amazon web services': ['aws'],
  'docker': ['containerization', 'containers', 'docker compose'],
  'k8s': ['kubernetes'],
  'kubernetes': ['k8s', 'container orchestration'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'github actions', 'jenkins'],
  'spring': ['spring boot', 'spring framework'],
  'spring boot': ['spring', 'spring framework', 'java spring'],
  'git': ['version control', 'github', 'gitlab'],
  'javascript': ['js', 'es6', 'ecmascript'],
  'typescript': ['ts'],
  'gcp': ['google cloud platform', 'google cloud'],
  'vue': ['vue.js', 'vuejs'],
  'angular': ['angular.js', 'angularjs']
};

/**
 * Normalizes text for matching
 */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s.+/-]/g, '');
}

/**
 * Checks match between candidate skill and job requirement
 * Returns 'MATCHED', 'PARTIAL', or 'MISSING'
 */
function evaluateSkillMatch(reqName, userSkillsList) {
  const normReq = normalize(reqName);
  const userNorms = userSkillsList.map(s => normalize(s));

  // Exact match
  if (userNorms.includes(normReq)) {
    return { status: 'MATCHED', matchType: 'Exact' };
  }

  // Synonym / Semantic match
  const synonyms = SYNONYMS[normReq] || [];
  for (const syn of synonyms) {
    if (userNorms.includes(normalize(syn))) {
      return { status: 'MATCHED', matchType: 'Semantic' };
    }
  }

  // Substring / Partial match
  for (const userSkill of userNorms) {
    if (normReq.includes(userSkill) || userSkill.includes(normReq)) {
      if (Math.min(normReq.length, userSkill.length) >= 3) {
        return { status: 'PARTIAL', matchType: 'Partial' };
      }
    }
    // Check if any synonym matches partially
    for (const syn of synonyms) {
      if (userSkill.includes(normalize(syn)) || normalize(syn).includes(userSkill)) {
        return { status: 'PARTIAL', matchType: 'Partial' };
      }
    }
  }

  return { status: 'MISSING', matchType: 'None' };
}

/**
 * Flattens all user skills into a single array
 */
function getAllUserSkills(profileOrResume) {
  const skillsObj = profileOrResume.skills || {};
  const set = new Set();

  Object.values(skillsObj).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(s => s && set.add(String(s).trim()));
    }
  });

  // Also include technologies mentioned in experience & projects
  if (Array.isArray(profileOrResume.experience)) {
    profileOrResume.experience.forEach(exp => {
      if (Array.isArray(exp.technologies)) {
        exp.technologies.forEach(t => t && set.add(String(t).trim()));
      }
    });
  }

  if (Array.isArray(profileOrResume.projects)) {
    profileOrResume.projects.forEach(proj => {
      if (Array.isArray(proj.technologies)) {
        proj.technologies.forEach(t => t && set.add(String(t).trim()));
      }
    });
  }

  return Array.from(set);
}

/**
 * Match a resume/profile against a job analysis
 */
function matchResumeToJob(resumeOrProfile, jobAnalysis) {
  const userSkills = getAllUserSkills(resumeOrProfile);
  const requirements = jobAnalysis.requirementsTable || [];

  const matchedItems = [];
  const partialItems = [];
  const missingItems = [];

  const foundKeywords = [];
  const missingKeywords = [];
  const relatedKeywords = [];

  requirements.forEach(req => {
    const { status, matchType } = evaluateSkillMatch(req.name, userSkills);

    const item = {
      name: req.name,
      category: req.category,
      priority: req.priority || 'Required',
      importance: req.importance || (req.priority === 'Required' ? 'High' : 'Medium'),
      status,
      matchType
    };

    if (status === 'MATCHED') {
      matchedItems.push(item);
      foundKeywords.push({
        keyword: req.name,
        importance: item.importance,
        matchType
      });
    } else if (status === 'PARTIAL') {
      partialItems.push(item);
      relatedKeywords.push({
        keyword: req.name,
        importance: item.importance,
        matchType
      });
    } else {
      missingItems.push(item);
      missingKeywords.push({
        keyword: req.name,
        importance: item.importance,
        reason: 'Not found in verified profile'
      });
    }
  });

  // Overall match score calculation
  const total = requirements.length;
  let matchPercentage = 0;
  if (total > 0) {
    const score = (matchedItems.length * 1.0 + partialItems.length * 0.5) / total;
    matchPercentage = Math.round(score * 100);
  } else {
    matchPercentage = 75; // Baseline if no strict requirements table
  }

  return {
    matchPercentage,
    summary: {
      totalRequirements: total,
      matchedCount: matchedItems.length,
      partialCount: partialItems.length,
      missingCount: missingItems.length
    },
    matchedItems,
    partialItems,
    missingItems,
    keywords: {
      found: foundKeywords,
      missing: missingKeywords,
      related: relatedKeywords
    }
  };
}

module.exports = {
  matchResumeToJob,
  getAllUserSkills,
  evaluateSkillMatch,
  SYNONYMS
};
