const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const JobAnalysis = require('../models/JobAnalysis');
const { analyzeSkillGaps } = require('../services/ai/skillGapAnalyzer');

// @desc    Analyze skill gaps and generate structured learning roadmaps
// @route   POST /api/skills/gap-roadmap
// @access  Private
exports.getSkillGapRoadmap = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide jobId.' });
    }

    const job = await Job.findOne({ _id: jobId, user: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const jobAnalysis = await JobAnalysis.findOne({ job: jobId, user: req.user.id });
    if (!jobAnalysis) {
      return res.status(404).json({ success: false, message: 'Job analysis not found.' });
    }

    let candidateSource = null;
    if (resumeId) {
      candidateSource = await Resume.findOne({ _id: resumeId, user: req.user.id });
    } else {
      candidateSource = await Profile.findOne({ user: req.user.id });
    }

    if (!candidateSource) {
      return res.status(404).json({ success: false, message: 'Profile or Resume data not found.' });
    }

    const gapResult = analyzeSkillGaps(candidateSource, jobAnalysis);

    res.status(200).json({
      success: true,
      data: {
        targetRole: job.role,
        targetCompany: job.company,
        ...gapResult
      }
    });
  } catch (err) {
    next(err);
  }
};
