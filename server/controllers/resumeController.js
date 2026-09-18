const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const Profile = require('../models/Profile');
const Activity = require('../models/Activity');
const { parseDocumentBuffer } = require('../services/parser/resumeParser');
const { generateDocxBuffer } = require('../services/export/docxExporter');

// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resume by id
// @route   GET /api/resumes/:id
// @access  Private
exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }
    res.status(200).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new resume (optionally populate from master profile)
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    const { title, templateId, fromMaster, targetRole, targetCompany } = req.body;

    let initialData = {
      title: title || 'New Resume',
      templateId: templateId || 'ats-classic',
      targetRole: targetRole || '',
      targetCompany: targetCompany || '',
      user: req.user.id
    };

    if (fromMaster) {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        initialData.personalInfo = profile.personalInfo;
        initialData.summary = profile.summary;
        initialData.education = profile.education;
        initialData.skills = profile.skills;
        initialData.experience = profile.experience;
        initialData.projects = profile.projects;
        initialData.certifications = profile.certifications;
        initialData.achievements = profile.achievements;
        initialData.languages = profile.languages;
      }
    }

    const resume = await Resume.create(initialData);

    // Create initial version snapshot
    await ResumeVersion.create({
      resume: resume._id,
      user: req.user.id,
      versionNumber: 1,
      title: 'Initial Creation',
      snapshot: resume.toObject()
    });

    await Activity.create({
      user: req.user.id,
      action: 'Created Resume',
      type: 'resume',
      details: `Created resume "${resume.title}".`,
      targetId: resume._id
    });

    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const fields = ['title', 'templateId', 'targetRole', 'targetCompany', 'targetJob', 'personalInfo', 'summary', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements', 'languages', 'sectionOrder', 'formatting', 'atsScore'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        resume[f] = req.body[f];
      }
    });

    resume.versionNumber = (resume.versionNumber || 1) + 1;
    await resume.save();

    // Save version history snapshot every 5 updates or when explicitly tagged
    if (req.body.saveSnapshot) {
      await ResumeVersion.create({
        resume: resume._id,
        user: req.user.id,
        versionNumber: resume.versionNumber,
        title: req.body.snapshotNote || `Version ${resume.versionNumber}`,
        snapshot: resume.toObject(),
        atsScore: resume.atsScore?.overallScore || 0
      });
    }

    await Activity.create({
      user: req.user.id,
      action: 'Updated Resume',
      type: 'resume',
      details: `Saved changes to "${resume.title}".`,
      targetId: resume._id
    });

    res.status(200).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    await ResumeVersion.deleteMany({ resume: req.params.id });

    await Activity.create({
      user: req.user.id,
      action: 'Deleted Resume',
      type: 'resume',
      details: `Deleted resume "${resume.title}".`
    });

    res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Duplicate resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private
exports.duplicateResume = async (req, res, next) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original resume not found.' });
    }

    const copyData = original.toObject();
    delete copyData._id;
    delete copyData.createdAt;
    delete copyData.updatedAt;
    copyData.title = `${original.title} (Copy)`;
    copyData.isMaster = false;
    copyData.versionNumber = 1;

    const duplicated = await Resume.create(copyData);

    await Activity.create({
      user: req.user.id,
      action: 'Duplicated Resume',
      type: 'resume',
      details: `Duplicated "${original.title}" to "${duplicated.title}".`,
      targetId: duplicated._id
    });

    res.status(201).json({ success: true, data: duplicated });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload & Parse resume document (PDF, DOCX, TXT)
// @route   POST /api/resumes/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF, DOCX, or TXT file.' });
    }

    const { rawText, structured } = await parseDocumentBuffer(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    // Return structured data to user for review before committing to database
    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully. Please review and verify extracted information.',
      extractedData: structured,
      fileName: req.file.originalname
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export resume as DOCX
// @route   GET /api/resumes/:id/export/docx
// @access  Private
exports.exportDocx = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const buffer = await generateDocxBuffer(resume);

    const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_ATS_Resume.docx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// @desc    Export resume as plain TXT
// @route   GET /api/resumes/:id/export/txt
// @access  Private
exports.exportTxt = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const p = resume.personalInfo || {};
    let txt = `=======================================================\n`;
    txt += `${p.fullName || 'Candidate Name'}\n`;
    txt += `${p.professionalTitle || ''} | ${p.email || ''} | ${p.phone || ''} | ${p.location || ''}\n`;
    if (p.linkedin) txt += `LinkedIn: ${p.linkedin}\n`;
    if (p.github) txt += `GitHub: ${p.github}\n`;
    txt += `=======================================================\n\n`;

    if (resume.summary) {
      txt += `PROFESSIONAL SUMMARY\n--------------------\n${resume.summary}\n\n`;
    }

    if (Array.isArray(resume.experience) && resume.experience.length > 0) {
      txt += `WORK EXPERIENCE\n---------------\n`;
      resume.experience.forEach(exp => {
        txt += `${exp.role} - ${exp.company} (${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate})\n`;
        if (exp.description) txt += `${exp.description}\n`;
        (exp.achievements || []).forEach(ach => {
          if (ach) txt += `* ${ach}\n`;
        });
        txt += `\n`;
      });
    }

    if (Array.isArray(resume.projects) && resume.projects.length > 0) {
      txt += `PROJECTS\n--------\n`;
      resume.projects.forEach(proj => {
        txt += `${proj.name} (${proj.technologies?.join(', ') || ''})\n`;
        if (proj.description) txt += `${proj.description}\n`;
        (proj.achievements || []).forEach(ach => {
          if (ach) txt += `* ${ach}\n`;
        });
        txt += `\n`;
      });
    }

    const skills = resume.skills || {};
    txt += `TECHNICAL SKILLS\n----------------\n`;
    if (skills.programmingLanguages?.length) txt += `Languages: ${skills.programmingLanguages.join(', ')}\n`;
    if (skills.frameworks?.length) txt += `Frameworks: ${skills.frameworks.join(', ')}\n`;
    if (skills.databases?.length) txt += `Databases: ${skills.databases.join(', ')}\n`;
    if (skills.cloud?.length) txt += `Cloud & DevOps: ${skills.cloud.join(', ')}\n`;
    if (skills.tools?.length) txt += `Tools: ${skills.tools.join(', ')}\n`;
    if (skills.softSkills?.length) txt += `Soft Skills: ${skills.softSkills.join(', ')}\n\n`;

    if (Array.isArray(resume.education) && resume.education.length > 0) {
      txt += `EDUCATION\n---------\n`;
      resume.education.forEach(edu => {
        txt += `${edu.degree} in ${edu.field} | ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
        if (edu.cgpa) txt += `CGPA: ${edu.cgpa}\n`;
        txt += `\n`;
      });
    }

    const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_ATS_Resume.txt`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(txt);
  } catch (err) {
    next(err);
  }
};

// @desc    Compare versions (Diff Master vs Tailored)
// @route   GET /api/resumes/:id/compare
// @access  Private
exports.compareVersions = async (req, res, next) => {
  try {
    const tailoredResume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!tailoredResume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const masterProfile = await Profile.findOne({ user: req.user.id });

    // Compute differences
    const masterSkills = (masterProfile?.skills?.programmingLanguages || []).concat(masterProfile?.skills?.frameworks || []);
    const tailoredSkills = (tailoredResume.skills?.programmingLanguages || []).concat(tailoredResume.skills?.frameworks || []);

    const diff = {
      title: {
        master: 'Master Profile',
        tailored: tailoredResume.title
      },
      summary: {
        master: masterProfile?.summary || '',
        tailored: tailoredResume.summary || '',
        isModified: (masterProfile?.summary || '') !== (tailoredResume.summary || '')
      },
      skills: {
        master: masterSkills,
        tailored: tailoredSkills,
        added: tailoredSkills.filter(s => !masterSkills.includes(s)),
        removed: masterSkills.filter(s => !tailoredSkills.includes(s))
      },
      experienceCount: {
        master: masterProfile?.experience?.length || 0,
        tailored: tailoredResume.experience?.length || 0
      },
      projectsCount: {
        master: masterProfile?.projects?.length || 0,
        tailored: tailoredResume.projects?.length || 0
      }
    };

    res.status(200).json({ success: true, data: diff });
  } catch (err) {
    next(err);
  }
};
