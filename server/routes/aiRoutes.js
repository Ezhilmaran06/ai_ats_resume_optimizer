const express = require('express');
const {
  analyzeRoleWithPython,
  analyzeKeywordsWithPython,
  analyzeMatchWithPython,
  optimizeResumeWithPython,
  getOptimizationPlanWithPython
} = require('../services/ai/pythonAiClient');
const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
const { matchResumeToJob } = require('../services/matching/matchingEngine');
const { optimizeResumeForJob } = require('../services/ai/resumeOptimizer');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @desc    POST /api/ai/role/analyze
 * @access  Public / Private (supports both authenticated and quick analysis)
 */
router.post('/role/analyze', async (req, res, next) => {
  try {
    const { role, jobTitle, description, jobDescription, rawText, company } = req.body;
    const finalRole = jobTitle || role || 'Software Engineer';
    const jdText = jobDescription || description || rawText || '';

    if (!jdText || jdText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid job description.'
      });
    }

    try {
      const pythonAnalysis = await analyzeRoleWithPython(finalRole, jdText, company || '');
      const techSkills = Array.from(new Set([
        ...(pythonAnalysis?.technicalSkills || []),
        ...(pythonAnalysis?.programmingLanguages || []),
        ...(pythonAnalysis?.frameworks || []),
        ...(pythonAnalysis?.databases || []),
        ...(pythonAnalysis?.cloudTechnologies || []),
        ...(pythonAnalysis?.tools || []),
        ...(pythonAnalysis?.extractedSkills || [])
      ]));

      const roleContract = {
        title: pythonAnalysis?.title || pythonAnalysis?.jobTitle || finalRole,
        requiredSkills: Array.isArray(pythonAnalysis?.requiredSkills) ? pythonAnalysis.requiredSkills : [],
        preferredSkills: Array.isArray(pythonAnalysis?.preferredSkills) ? pythonAnalysis.preferredSkills : [],
        technicalSkills: techSkills,
        softSkills: Array.isArray(pythonAnalysis?.softSkills) ? pythonAnalysis.softSkills : [],
        responsibilities: Array.isArray(pythonAnalysis?.responsibilities) ? pythonAnalysis.responsibilities : [],
        keywords: Array.isArray(pythonAnalysis?.keywords) ? pythonAnalysis.keywords : [],
        education: Array.isArray(pythonAnalysis?.education) ? pythonAnalysis.education : [],
        experience: Array.isArray(pythonAnalysis?.experience) ? pythonAnalysis.experience : []
      };

      return res.status(200).json({
        success: true,
        role: roleContract,
        data: pythonAnalysis
      });
    } catch (pyErr) {
      console.warn('[AI Routes] Python service fallback for role analysis:', pyErr.message);
      const fallbackAnalysis = await analyzeJobDescription(jdText, finalRole, company);
      const roleContract = {
        title: finalRole,
        requiredSkills: fallbackAnalysis.requiredSkills || [],
        preferredSkills: fallbackAnalysis.preferredSkills || [],
        technicalSkills: fallbackAnalysis.extractedSkills || [],
        softSkills: fallbackAnalysis.softSkills || [],
        responsibilities: fallbackAnalysis.responsibilities || [],
        keywords: fallbackAnalysis.keywords || [],
        education: fallbackAnalysis.education || [],
        experience: fallbackAnalysis.experience || []
      };

      return res.status(200).json({
        success: true,
        role: roleContract,
        data: fallbackAnalysis
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @desc    POST /api/ai/match/analyze
 * @access  Public / Private
 */
router.post('/match/analyze', async (req, res, next) => {
  try {
    const { resume, role, job, description, rawText } = req.body;
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume data for matching.'
      });
    }

    const rolePayload = role || job || {
      role: 'Software Engineer',
      description: description || rawText || ''
    };

    try {
      const matchResult = await analyzeMatchWithPython(resume, rolePayload);
      const matched = Array.isArray(matchResult?.matched) ? matchResult.matched : (matchResult?.matchedSkills || []);
      const partial = Array.isArray(matchResult?.partial) ? matchResult.partial : (matchResult?.partialSkills || []);
      const missing = Array.isArray(matchResult?.missing) ? matchResult.missing : (matchResult?.missingSkills || []);
      const score = matchResult?.score ?? matchResult?.matchPercentage ?? 75;
      const recommendations = Array.isArray(matchResult?.recommendations) ? matchResult.recommendations : [];

      const matchContract = {
        score,
        matched,
        partial,
        missing,
        recommendations
      };

      return res.status(200).json({
        success: true,
        match: matchContract,
        data: matchResult
      });
    } catch (pyErr) {
      console.warn('[AI Routes] Python service fallback for semantic matching:', pyErr.message);
      const fallbackResult = matchResumeToJob(resume, rolePayload);
      const matched = fallbackResult.matchedItems || [];
      const partial = fallbackResult.partialItems || [];
      const missing = fallbackResult.missingItems || [];
      const score = fallbackResult.matchPercentage || 75;

      const matchContract = {
        score,
        matched,
        partial,
        missing,
        recommendations: [
          'Align project descriptions with the core skills in the job posting.',
          'Position matched technologies prominently in your technical skills section.'
        ]
      };

      return res.status(200).json({
        success: true,
        match: matchContract,
        data: {
          matchedSkills: matched,
          partialSkills: partial,
          missingSkills: missing,
          matchPercentage: score,
          explanations: matched.reduce((acc, m) => {
            acc[m.name] = `${m.matchType || 'Verified'} match in candidate resume.`;
            return acc;
          }, {})
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @desc    POST /api/ai/resume/optimize
 * @access  Public / Private
 */
router.post('/resume/optimize', async (req, res, next) => {
  try {
    const { resume, role, job } = req.body;
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume data to optimize.'
      });
    }

    try {
      const plan = await optimizeResumeWithPython(resume, role || job || {});
      const changes = Array.isArray(plan?.changes) ? plan.changes : (plan?.suggestions || []);
      const warnings = Array.isArray(plan?.warnings) ? plan.warnings : [];
      const optimizedResume = plan?.optimizedResume || {};

      return res.status(200).json({
        success: true,
        changes,
        optimizedResume,
        warnings,
        data: plan
      });
    } catch (pyErr) {
      console.warn('[AI Routes] Python service fallback for resume optimizer:', pyErr.message);
      const fallbackPlan = await optimizeResumeForJob(resume, role || job || {}, { requirementsTable: [] });
      return res.status(200).json({
        success: true,
        changes: fallbackPlan.suggestions || [],
        optimizedResume: fallbackPlan.optimizedResume || {},
        warnings: [
          'Anti-Fabrication Policy: Unverified skills from job description were not added to your resume.'
        ],
        data: fallbackPlan
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
