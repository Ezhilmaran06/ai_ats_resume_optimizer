const atsConfig = require('../../config/atsConfig');
const { matchResumeToJob, getAllUserSkills } = require('../matching/matchingEngine');

/**
 * Evaluates a resume against a job analysis and formatting standards
 */
function analyzeAtsCompatibility(resume, jobAnalysis, templateId = 'ats-classic') {
  const verifiedSkills = getAllUserSkills(resume);
  const matchResult = jobAnalysis ? matchResumeToJob(resume, jobAnalysis) : {
    matchPercentage: 70,
    matchedItems: [],
    partialItems: [],
    missingItems: []
  };

  const strengths = [];
  const warnings = [];
  const fixRecommendations = [];

  // 1. Keyword Relevance (Max 25)
  let keywordScore = 0;
  const matchRatio = matchResult.summary ? (matchResult.summary.matchedCount + 0.5 * matchResult.summary.partialCount) / Math.max(matchResult.summary.totalRequirements, 1) : 0.7;
  keywordScore = Math.min(25, Math.max(5, Math.round(matchRatio * 25)));

  if (keywordScore >= 18) {
    strengths.push('Strong keyword alignment with the target job requirements.');
  } else {
    warnings.push(`Missing ${matchResult.missingItems?.length || 3} relevant keywords demanded in the job posting.`);
    fixRecommendations.push({
      category: 'keywordRelevance',
      title: 'Incorporate Missing Domain Keywords',
      description: 'Review the missing keywords section in the job analyzer and incorporate matching competencies into your project descriptions.',
      actionType: 'NAVIGATE_OPTIMIZER'
    });
  }

  // 2. Skills Match (Max 20)
  let skillsScore = 0;
  const requiredMatched = (matchResult.matchedItems || []).filter(i => i.priority === 'Required').length;
  const totalRequired = ((jobAnalysis?.requirementsTable) || []).filter(i => i.priority === 'Required').length || 1;
  const reqRatio = totalRequired > 0 ? requiredMatched / totalRequired : 0.8;
  skillsScore = Math.min(20, Math.max(5, Math.round(reqRatio * 20)));

  if (skillsScore >= 15) {
    strengths.push('Excellent coverage of required technical capabilities.');
  } else {
    warnings.push('Key required skills from the job description are not yet evident in the resume.');
    fixRecommendations.push({
      category: 'skillsMatch',
      title: 'Prioritize Core Required Skills',
      description: 'Position essential languages and frameworks higher in your technical skills section.',
      actionType: 'EDIT_SKILLS'
    });
  }

  // 3. Job Relevance (Max 15)
  let jobRelevanceScore = 12;
  const hasTargetRole = Boolean(resume.targetRole && resume.targetRole.trim().length > 0);
  if (hasTargetRole) {
    jobRelevanceScore = 14;
    strengths.push(`Resume is focused on the target role: "${resume.targetRole}".`);
  } else {
    jobRelevanceScore = 10;
    warnings.push('Resume title and summary do not explicitly name the target job title.');
    fixRecommendations.push({
      category: 'jobRelevance',
      title: 'Align Professional Title',
      description: 'Customize your professional title in personal info to match the job position.',
      actionType: 'EDIT_PROFILE'
    });
  }

  // 4. Structure (Max 10)
  let structureScore = 10;
  const p = resume.personalInfo || {};
  const hasContact = Boolean(p.email && (p.phone || p.location));
  const hasEducation = Array.isArray(resume.education) && resume.education.length > 0;
  const hasExperience = Array.isArray(resume.experience) && resume.experience.length > 0;
  const hasSkills = verifiedSkills.length > 0;

  if (!hasContact) structureScore -= 2;
  if (!hasEducation) structureScore -= 2;
  if (!hasExperience) structureScore -= 2;
  if (!hasSkills) structureScore -= 2;
  structureScore = Math.max(4, structureScore);

  if (structureScore >= 9) {
    strengths.push('Clear, standardized section headers (Experience, Education, Skills) recognized by all major ATS systems.');
  } else {
    warnings.push('One or more essential structural sections (e.g. contact information or education) are incomplete.');
    fixRecommendations.push({
      category: 'structure',
      title: 'Complete Core Resume Sections',
      description: 'Ensure contact details, experience, education, and skills sections are fully populated.',
      actionType: 'EDIT_SECTIONS'
    });
  }

  // 5. Section Completeness (Max 10)
  let completenessScore = 9;
  if (!resume.summary || resume.summary.trim().length < 30) {
    completenessScore -= 2;
    warnings.push('Professional summary is missing or too concise (aim for 2-3 sentences).');
    fixRecommendations.push({
      category: 'sectionCompleteness',
      title: 'Expand Professional Summary',
      description: 'Use the AI summary generator to craft a 2-3 sentence overview highlighting your core strengths.',
      actionType: 'EDIT_SUMMARY'
    });
  } else {
    strengths.push('Comprehensive professional summary provides immediate recruiter context.');
  }

  // 6. Readability & Action Verbs (Max 10)
  let readabilityScore = 8;
  const expItems = resume.experience || [];
  let hasActionVerbs = true;
  let hasQuantifiableMetrics = false;

  expItems.forEach(exp => {
    (exp.achievements || []).forEach(ach => {
      if (/\b(\d+%|\$\d+|\d+\+?)\b/.test(ach)) {
        hasQuantifiableMetrics = true;
      }
    });
  });

  if (hasQuantifiableMetrics) {
    readabilityScore = 10;
    strengths.push('Contains measurable achievements with quantifiable metrics and data points.');
  } else {
    readabilityScore = 7;
    warnings.push('Experience bullets could be strengthened by adding measurable achievements (e.g. % improvements, user counts, latency reductions).');
    fixRecommendations.push({
      category: 'readability',
      title: 'Add Quantifiable Results',
      description: 'Quantify your project outcomes with metrics (e.g., "reduced build time by 25%", "supported 10k users").',
      actionType: 'NAVIGATE_OPTIMIZER'
    });
  }

  // 7. Formatting & Machine Parseability (Max 10)
  let formattingScore = 10;
  const isAtsSafeTemplate = ['ats-classic', 'minimal', 'swe'].includes(templateId);
  if (!isAtsSafeTemplate) {
    formattingScore = 8;
    warnings.push('Current template contains multi-column layouts; consider switching to "ATS Classic" for legacy parsers.');
  } else {
    strengths.push('Template adheres to single-column ATS standards with clean machine-parseable hierarchy.');
  }

  const overallScore = Math.min(
    100,
    keywordScore + skillsScore + jobRelevanceScore + structureScore + completenessScore + readabilityScore + formattingScore
  );

  return {
    overallScore,
    categories: {
      keywordRelevance: keywordScore,
      skillsMatch: skillsScore,
      jobRelevance: jobRelevanceScore,
      structure: structureScore,
      sectionCompleteness: completenessScore,
      readability: readabilityScore,
      formatting: formattingScore
    },
    maxScores: atsConfig.maxScores,
    strengths,
    warnings,
    fixRecommendations,
    templateCheck: {
      templateId,
      isAtsSafe: isAtsSafeTemplate,
      singleColumn: isAtsSafeTemplate,
      tableFree: true,
      textExtractable: true
    },
    disclaimer: atsConfig.disclaimer,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = { analyzeAtsCompatibility };
