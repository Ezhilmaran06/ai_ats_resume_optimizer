const {
  analyzeRoleWithPython,
  analyzeKeywordsWithPython,
  analyzeMatchWithPython,
  getOptimizationPlanWithPython
} = require('../services/ai/pythonAiClient');
const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
const { matchResumeToJob } = require('../services/matching/matchingEngine');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @desc    POST /api/ai/role/analyze
 * @access  Public / Private (supports both authenticated and quick analysis)
 */
router.post('/role/analyze', async (req, res, next) => {
  try {
    const { role, description, rawText, company } = req.body;
    const jdText = description || rawText || '';

    if (!jdText || jdText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid job description.'
      });
    }

    try {
      const pythonAnalysis = await analyzeRoleWithPython(role || 'Software Engineer', jdText, company || '');
      return res.status(200).json({
        success: true,
        data: pythonAnalysis
      });
    } catch (pyErr) {
      console.warn('[AI Routes] Python service fallback for role analysis:', pyErr.message);
      const fallbackAnalysis = await analyzeJobDescription(jdText, role, company);
      return res.status(200).json({
        success: true,
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
      return res.status(200).json({
        success: true,
        data: matchResult
      });
    } catch (pyErr) {
      console.warn('[AI Routes] Python service fallback for semantic matching:', pyErr.message);
      const fallbackResult = matchResumeToJob(resume, rolePayload);
      return res.status(200).json({
        success: true,
        data: {
          matchedSkills: fallbackResult.matchedItems || [],
          partialSkills: fallbackResult.partialItems || [],
          missingSkills: fallbackResult.missingItems || [],
          matchPercentage: fallbackResult.matchPercentage || 75,
          explanations: (fallbackResult.matchedItems || []).reduce((acc, m) => {
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

    const { optimizeResumeWithPython } = require('../services/ai/pythonAiClient');
    const { optimizeResumeForJob } = require('../services/ai/resumeOptimizer');

    try {
      const plan = await optimizeResumeWithPython(resume, role || job || {});
      return res.status(200).json({
        success: true,
        data: plan
      });
    } catch (pyErr) {
      console.warn('[AI Routes] Python service fallback for resume optimizer:', pyErr.message);
      const fallbackPlan = await optimizeResumeForJob(resume, role || job || {}, { requirementsTable: [] });
      return res.status(200).json({
        success: true,
        data: fallbackPlan
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
