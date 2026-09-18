const Resume = require('../models/Resume');
const JobAnalysis = require('../models/JobAnalysis');
const Activity = require('../models/Activity');
const { analyzeAtsCompatibility } = require('../services/ai/atsAnalyzer');

// @desc    Run ATS compatibility analysis on a resume
// @route   POST /api/ats/analyze
// @access  Private
exports.analyzeAts = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    let jobAnalysis = null;
    if (jobId) {
      jobAnalysis = await JobAnalysis.findOne({ job: jobId, user: req.user.id });
    } else if (resume.targetJob) {
      jobAnalysis = await JobAnalysis.findOne({ job: resume.targetJob, user: req.user.id });
    }

    const report = analyzeAtsCompatibility(resume, jobAnalysis, resume.templateId);

    // Cache score on resume document
    resume.atsScore = {
      overallScore: report.overallScore,
      categories: report.categories,
      lastAnalyzed: new Date()
    };
    await resume.save();

    await Activity.create({
      user: req.user.id,
      action: 'Run ATS Analysis',
      type: 'ats',
      details: `Calculated ATS Compatibility Score of ${report.overallScore}/100 for "${resume.title}".`,
      targetId: resume._id
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};
