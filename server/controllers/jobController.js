const Job = require('../models/Job');
const JobAnalysis = require('../models/JobAnalysis');
const Activity = require('../models/Activity');
const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
const { parseDocumentBuffer } = require('../services/parser/resumeParser');
const { analyzeRoleWithPython } = require('../services/ai/pythonAiClient');

const DEMO_JOB_TEXT = `Senior Full-Stack Engineer — CloudScale Technologies
Location: San Francisco, CA / Remote

About the Role:
CloudScale Technologies is seeking a Senior Full-Stack Engineer to lead the design and development of our next-generation cloud infrastructure management platform. You will build high-performance web applications and resilient microservices serving millions of developers worldwide.

Responsibilities:
• Architect, build, and deploy scalable full-stack web applications using React, Node.js, Express, and modern JavaScript/TypeScript.
• Design robust RESTful APIs and integrate high-throughput distributed database solutions (PostgreSQL, MongoDB, and Redis).
• Collaborate with DevOps and infrastructure teams to deploy containerized services via Docker and Kubernetes on AWS.
• Implement automated CI/CD deployment pipelines using GitHub Actions with comprehensive unit and integration test coverage.
• Optimize application latency, query performance, and front-end bundle sizes to deliver sub-100ms response times.
• Mentor junior engineers and champion clean code, system architecture, and agile software development best practices.

Requirements (Required):
• 3+ years of professional full-stack web development experience.
• Strong proficiency in JavaScript, TypeScript, React, Node.js, and Express.js.
• Demonstrated expertise in database modeling with PostgreSQL or MongoDB.
• Deep understanding of RESTful API architecture and asynchronous programming.
• Solid experience with Git version control and collaborative development.
• Strong problem solving, communication, and agile teamwork skills.

Preferred Qualifications:
• Hands-on experience with Docker containerization and Kubernetes orchestration.
• Familiarity with AWS services (EC2, S3, RDS, Lambda).
• Experience implementing Redis caching mechanisms and message queues.
• Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.`;

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).populate('analysis').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id }).populate('analysis');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Create and analyze a job description (pasted or uploaded file)
// @route   POST /api/jobs
// @access  Private
exports.createAndAnalyzeJob = async (req, res, next) => {
  try {
    let { company, role, location, jobUrl, rawText } = req.body;
    let sourceType = 'pasted';

    if (req.file) {
      const parsed = await parseDocumentBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
      rawText = parsed.rawText;
      sourceType = 'uploaded_file';
    }

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid job description (at least 20 characters) or upload a document.'
      });
    }

    // Run Python FastAPI role analyzer with fallback to local engine
    let analysisResult = null;
    try {
      const pyAnalysis = await analyzeRoleWithPython(role || 'Target Role', rawText, company || '');
      analysisResult = {
        extractedRole: pyAnalysis.jobTitle || pyAnalysis.role,
        extractedCompany: pyAnalysis.company,
        requiredSkills: pyAnalysis.requiredSkills || [],
        preferredSkills: pyAnalysis.preferredSkills || [],
        programmingLanguages: pyAnalysis.programmingLanguages || [],
        frameworks: pyAnalysis.frameworks || [],
        databases: pyAnalysis.databases || [],
        cloudTechnologies: pyAnalysis.cloudTechnologies || [],
        tools: pyAnalysis.tools || [],
        softSkills: pyAnalysis.softSkills || [],
        responsibilities: pyAnalysis.responsibilities || [],
        educationRequirements: pyAnalysis.education || [],
        experienceRequirements: pyAnalysis.experience || [],
        certifications: pyAnalysis.certifications || [],
        domainKeywords: pyAnalysis.keywords || [],
        actionVerbs: pyAnalysis.actionVerbs || [],
        requirementsTable: (pyAnalysis.classifiedRequirements || []).map(r => ({
          name: r.name,
          category: r.category === 'Programming Languages' ? 'Programming Language' : (r.category || 'Other'),
          priority: r.classification || 'Required',
          importance: r.importance || 'High'
        }))
      };
    } catch (pyErr) {
      console.warn('[Job Controller] Python role analyzer error, using local fallback:', pyErr.message);
      analysisResult = await analyzeJobDescription(rawText, role, company);
    }

    const job = await Job.create({
      user: req.user.id,
      company: company || analysisResult.extractedCompany || 'Target Employer',
      role: role || analysisResult.extractedRole || 'Target Role',
      location: location || 'Remote / Hybrid',
      jobUrl: jobUrl || '',
      sourceType,
      rawText
    });

    const jobAnalysis = await JobAnalysis.create({
      job: job._id,
      user: req.user.id,
      ...analysisResult
    });

    job.analysis = jobAnalysis._id;
    await job.save();

    await Activity.create({
      user: req.user.id,
      action: 'Analyzed Job Description',
      type: 'job',
      details: `Analyzed "${job.role}" at "${job.company}".`,
      targetId: job._id
    });

    res.status(201).json({
      success: true,
      message: 'Job description analyzed and saved successfully.',
      data: {
        job,
        analysis: jobAnalysis
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    await JobAnalysis.deleteMany({ job: req.params.id });

    await Activity.create({
      user: req.user.id,
      action: 'Deleted Job',
      type: 'job',
      details: `Removed job posting for "${job.role}".`
    });

    res.status(200).json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Seed sample demo job
// @route   POST /api/jobs/seed-demo
// @access  Private
exports.seedDemoJob = async (req, res, next) => {
  try {
    const analysisResult = await analyzeJobDescription(
      DEMO_JOB_TEXT,
      'Senior Full-Stack Engineer',
      'CloudScale Technologies'
    );

    const job = await Job.create({
      user: req.user.id,
      company: 'CloudScale Technologies',
      role: 'Senior Full-Stack Engineer',
      location: 'San Francisco, CA / Remote',
      jobUrl: 'https://cloudscale.example.com/careers/swe',
      sourceType: 'pasted',
      rawText: DEMO_JOB_TEXT
    });

    const jobAnalysis = await JobAnalysis.create({
      job: job._id,
      user: req.user.id,
      ...analysisResult
    });

    job.analysis = jobAnalysis._id;
    await job.save();

    await Activity.create({
      user: req.user.id,
      action: 'Loaded Demo Job',
      type: 'job',
      details: 'Loaded sample Senior Full-Stack Engineer JD.',
      targetId: job._id
    });

    res.status(201).json({
      success: true,
      message: 'Sample demo job created.',
      data: {
        job,
        analysis: jobAnalysis
      }
    });
  } catch (err) {
    next(err);
  }
};
