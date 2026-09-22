const express = require('express');
const {
  analyzeRoleWithPython,
  analyzeKeywordsWithPython,
  getOptimizationPlanWithPython
} = require('../services/ai/pythonAiClient');
const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
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

module.exports = router;
