const Profile = require('../models/Profile');
const Job = require('../models/Job');
const JobAnalysis = require('../models/JobAnalysis');
const Activity = require('../models/Activity');
const { generateInterviewQuestions, generateSelfIntroduction } = require('../services/ai/interviewGenerator');

// @desc    Generate role-specific interview preparation questions
// @route   POST /api/interview/generate
// @access  Private
exports.generateQuestions = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide jobId.' });
    }

    const job = await Job.findOne({ _id: jobId, user: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const jobAnalysis = await JobAnalysis.findOne({ job: jobId, user: req.user.id });
    if (!jobAnalysis) {
      return res.status(404).json({ success: false, message: 'Job analysis not found.' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Master Profile not found.' });
    }

    const result = await generateInterviewQuestions(profile, job, jobAnalysis);

    await Activity.create({
      user: req.user.id,
      action: 'Generated Interview Questions',
      type: 'interview',
      details: `Generated questions for ${job.role} at ${job.company}.`,
      targetId: job._id
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate 30s / 60s / 90s self-introduction pitches
// @route   POST /api/interview/pitch
// @access  Private
exports.generatePitch = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    let job = null;
    if (jobId) {
      job = await Job.findOne({ _id: jobId, user: req.user.id });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Master Profile not found.' });
    }

    const pitches = generateSelfIntroduction(profile, job);

    res.status(200).json({
      success: true,
      data: pitches
    });
  } catch (err) {
    next(err);
  }
};
