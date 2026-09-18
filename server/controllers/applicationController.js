const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Activity = require('../models/Activity');

// @desc    Get all job applications with filtering and sorting
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    const { status, search, sort } = req.query;

    let query = { user: req.user.id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { updatedAt: -1 };
    if (sort === 'dateApplied') {
      sortOption = { dateApplied: -1 };
    } else if (sort === 'company') {
      sortOption = { company: 1 };
    } else if (sort === 'atsScore') {
      sortOption = { atsScore: -1 };
    }

    const applications = await Application.find(query).populate('resumeUsed', 'title templateId').sort(sortOption);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new job application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    const { company, role, location, salary, status, dateApplied, deadline, resumeUsed, atsScore, jobUrl, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({ success: false, message: 'Please provide company and role.' });
    }

    let resumeTitle = '';
    if (resumeUsed) {
      const resDoc = await Resume.findById(resumeUsed);
      if (resDoc) resumeTitle = resDoc.title;
    }

    const application = await Application.create({
      user: req.user.id,
      company,
      role,
      location: location || '',
      salary: salary || '',
      status: status || 'Saved',
      dateApplied: dateApplied ? new Date(dateApplied) : (status === 'Applied' ? new Date() : null),
      deadline: deadline ? new Date(deadline) : null,
      resumeUsed: resumeUsed || null,
      resumeTitle,
      atsScore: atsScore || 0,
      jobUrl: jobUrl || '',
      notes: notes || ''
    });

    await Activity.create({
      user: req.user.id,
      action: 'Tracked Application',
      type: 'application',
      details: `Added application for "${role}" at "${company}".`,
      targetId: application._id
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update job application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res, next) => {
  try {
    let application = await Application.findOne({ _id: req.params.id, user: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const fields = ['company', 'role', 'location', 'salary', 'status', 'dateApplied', 'deadline', 'resumeUsed', 'atsScore', 'jobUrl', 'notes'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        application[f] = req.body[f];
      }
    });

    if (req.body.resumeUsed) {
      const resDoc = await Resume.findById(req.body.resumeUsed);
      if (resDoc) application.resumeTitle = resDoc.title;
    }

    await application.save();

    await Activity.create({
      user: req.user.id,
      action: 'Updated Application',
      type: 'application',
      details: `Updated status to "${application.status}" for "${application.role}".`,
      targetId: application._id
    });

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    await Activity.create({
      user: req.user.id,
      action: 'Deleted Application',
      type: 'application',
      details: `Removed application for "${application.role}".`
    });

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
