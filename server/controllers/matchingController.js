const Resume = require('../models/Resume');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const JobAnalysis = require('../models/JobAnalysis');
const Activity = require('../models/Activity');
const { matchResumeToJob } = require('../services/matching/matchingEngine');
const { optimizeResumeForJob } = require('../services/ai/resumeOptimizer');
const {
  analyzeKeywordsWithPython,
  analyzeMatchWithPython,
  optimizeResumeWithPython,
  getOptimizationPlanWithPython
} = require('../services/ai/pythonAiClient');

// @desc    Match resume or profile against a job description
// @route   POST /api/matching/analyze
// @access  Private
exports.analyzeMatching = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide a jobId.' });
    }

    const job = await Job.findOne({ _id: jobId, user: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const jobAnalysis = await JobAnalysis.findOne({ job: jobId, user: req.user.id });
    if (!jobAnalysis) {
      return res.status(404).json({ success: false, message: 'Job analysis not found.' });
    }

    let candidateData = null;
    if (resumeId) {
      candidateData = await Resume.findOne({ _id: resumeId, user: req.user.id });
    } else {
      candidateData = await Profile.findOne({ user: req.user.id });
    }

    if (!candidateData) {
      return res.status(404).json({ success: false, message: 'Resume or Profile not found.' });
    }

    let matchResults = null;
    try {
      const rolePayload = {
        role: job.role,
        company: job.company,
        extractedSkills: (jobAnalysis.requiredSkills || []).concat(jobAnalysis.preferredSkills || []).concat(jobAnalysis.skills?.map(s => s.name) || []),
        requiredSkills: jobAnalysis.requiredSkills || [],
        preferredSkills: jobAnalysis.preferredSkills || []
      };

      const [pyMatchResults, pyKwResults] = await Promise.all([
        analyzeMatchWithPython(candidateData.toObject(), rolePayload),
        analyzeKeywordsWithPython(candidateData.toObject(), rolePayload)
      ]);

      matchResults = {
        matchPercentage: pyMatchResults.matchPercentage,
        matchedSkills: pyMatchResults.matchedSkills || [],
        partialSkills: pyMatchResults.partialSkills || [],
        missingSkills: pyMatchResults.missingSkills || [],
        explanations: pyMatchResults.explanations || {},
        summary: {
          matchedCount: pyMatchResults.matchedSkills?.length || pyKwResults.matchedCount,
          partialCount: pyMatchResults.partialSkills?.length || pyKwResults.partialCount,
          missingCount: pyMatchResults.missingSkills?.length || pyKwResults.missingCount,
          totalJobSkills: pyMatchResults.totalRequirements || pyKwResults.totalCount
        },
        keywords: {
          list: pyKwResults.keywords || [],
          found: (pyKwResults.keywords || []).filter(k => k.status === 'MATCHED'),
          partial: (pyKwResults.keywords || []).filter(k => k.status === 'PARTIAL'),
          missing: (pyKwResults.keywords || []).filter(k => k.status === 'MISSING')
        }
      };
    } catch (pyErr) {
      console.warn('[Matching Controller] Python service error, using local matcher:', pyErr.message);
      const fallbackResult = matchResumeToJob(candidateData, jobAnalysis);
      matchResults = {
        matchPercentage: fallbackResult.matchPercentage,
        matchedSkills: fallbackResult.matchedItems || [],
        partialSkills: fallbackResult.partialItems || [],
        missingSkills: fallbackResult.missingItems || [],
        explanations: (fallbackResult.matchedItems || []).reduce((acc, m) => {
          acc[m.name] = `${m.matchType || 'Verified'} match in candidate resume.`;
          return acc;
        }, {}),
        summary: fallbackResult.summary,
        keywords: {
          list: [],
          found: fallbackResult.foundKeywords || [],
          partial: fallbackResult.relatedKeywords || [],
          missing: fallbackResult.missingKeywords || []
        }
      };
    }

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          role: job.role,
          company: job.company
        },
        candidateSource: resumeId ? 'Resume' : 'Master Profile',
        ...matchResults
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate AI tailored suggestions with anti-fabrication constraints
// @route   POST /api/matching/optimize
// @access  Private
exports.optimizeResume = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({ success: false, message: 'Please provide both resumeId and jobId.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const job = await Job.findOne({ _id: jobId, user: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const jobAnalysis = await JobAnalysis.findOne({ job: jobId, user: req.user.id });
    if (!jobAnalysis) {
      return res.status(404).json({ success: false, message: 'Job analysis not found.' });
    }

    let optimizationPlan = null;
    try {
      const rolePayload = {
        role: job.role,
        company: job.company,
        extractedSkills: (jobAnalysis.requiredSkills || []).concat(jobAnalysis.preferredSkills || []).concat(jobAnalysis.skills?.map(s => s.name) || []),
        requiredSkills: jobAnalysis.requiredSkills || [],
        preferredSkills: jobAnalysis.preferredSkills || []
      };
      optimizationPlan = await optimizeResumeWithPython(resume.toObject(), rolePayload);
    } catch (pyErr) {
      console.warn('[Matching Controller] Python optimizer error, using local optimizer:', pyErr.message);
      optimizationPlan = await optimizeResumeForJob(resume, job, jobAnalysis);
    }

    await Activity.create({
      user: req.user.id,
      action: 'Generated Tailored Suggestions',
      type: 'ats',
      details: `Generated ${optimizationPlan.suggestions?.length || 0} suggestions for "${resume.title}" targeting "${job.role}".`,
      targetId: resume._id
    });

    res.status(200).json({
      success: true,
      data: optimizationPlan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply accepted AI suggestions to resume
// @route   POST /api/matching/apply-suggestions
// @access  Private
exports.applySuggestions = async (req, res, next) => {
  try {
    const { resumeId, acceptedSuggestions } = req.body;

    if (!resumeId || !Array.isArray(acceptedSuggestions)) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and acceptedSuggestions array.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    acceptedSuggestions.forEach(item => {
      if (item.section === 'summary') {
        resume.summary = item.suggested;
      } else if (item.section === 'experience' && item.itemIndex !== null && item.itemIndex !== undefined) {
        if (resume.experience[item.itemIndex]) {
          if (item.field === 'description') {
            resume.experience[item.itemIndex].description = item.suggested;
          } else if (item.field.startsWith('achievements')) {
            const matchIdx = item.field.match(/\[(\d+)\]/);
            if (matchIdx && matchIdx[1]) {
              const aIdx = parseInt(matchIdx[1], 10);
              if (resume.experience[item.itemIndex].achievements) {
                resume.experience[item.itemIndex].achievements[aIdx] = item.suggested;
              }
            }
          }
        }
      } else if (item.section === 'projects' && item.itemIndex !== null && item.itemIndex !== undefined) {
        if (resume.projects[item.itemIndex] && item.field === 'description') {
          resume.projects[item.itemIndex].description = item.suggested;
        }
      }
    });

    resume.versionNumber = (resume.versionNumber || 1) + 1;
    await resume.save();

    await Activity.create({
      user: req.user.id,
      action: 'Applied Tailored Suggestions',
      type: 'resume',
      details: `Applied ${acceptedSuggestions.length} verified modifications to "${resume.title}".`,
      targetId: resume._id
    });

    res.status(200).json({
      success: true,
      message: 'Suggestions applied successfully to resume.',
      data: resume
    });
  } catch (err) {
    next(err);
  }
};
