const Resume = require('../models/Resume');
const JobAnalysis = require('../models/JobAnalysis');
const Job = require('../models/Job');
const Activity = require('../models/Activity');
const { analyzeAtsWithPython } = require('../services/ai/pythonAiClient');
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

    let jobData = null;
    let jobAnalysis = null;
    if (jobId) {
      jobData = await Job.findOne({ _id: jobId, user: req.user.id });
      jobAnalysis = await JobAnalysis.findOne({ job: jobId, user: req.user.id });
    } else if (resume.targetJob) {
      jobData = await Job.findOne({ _id: resume.targetJob, user: req.user.id });
      jobAnalysis = await JobAnalysis.findOne({ job: resume.targetJob, user: req.user.id });
    }

    let report = null;

    // Delegate to Python FastAPI ATS Engine
    try {
      const rolePayload = jobData ? {
        role: jobData.role,
        company: jobData.company,
        description: jobData.rawDescription || jobData.description,
        requiredSkills: jobAnalysis?.requiredSkills?.map(s => s.name) || [],
        extractedSkills: jobAnalysis?.skills?.map(s => s.name) || []
      } : (resume.targetRole ? { role: resume.targetRole, company: resume.targetCompany } : null);

      report = await analyzeAtsWithPython(resume.toObject(), rolePayload);
    } catch (pyErr) {
      console.warn('[ATS Controller] Python engine unavailable or error, falling back to local engine:', pyErr.message);
      report = analyzeAtsCompatibility(resume, jobAnalysis, resume.templateId);
    }

    // Cache score on resume document
    resume.atsScore = {
      overallScore: report.overallScore,
      categories: {
        structure: report.breakdown?.structure?.score || report.categories?.structure?.score || 8,
        sectionCompleteness: report.breakdown?.sectionCompleteness?.score || report.categories?.sectionCompleteness?.score || 8,
        readability: report.breakdown?.readability?.score || report.categories?.readability?.score || 8,
        keywordRelevance: report.breakdown?.keywordQuality?.score || report.categories?.keywordRelevance?.score || 16,
        skillsMatch: report.breakdown?.skillsPresentation?.score || report.categories?.skillsMatch?.score || 16,
        formatting: report.breakdown?.formatting?.score || report.categories?.formatting?.score || 8,
        jobRelevance: report.breakdown?.contentQuality?.score || report.categories?.jobRelevance?.score || 15
      },
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

