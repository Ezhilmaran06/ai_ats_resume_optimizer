const Profile = require('../models/Profile');
const Activity = require('../models/Activity');
const aiClient = require('../services/ai/aiClient');

// Standard verified demo profile for instant evaluation
const DEMO_PROFILE_DATA = {
  personalInfo: {
    fullName: 'Alex Morgan',
    professionalTitle: 'Full-Stack Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA / Remote',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    github: 'https://github.com/alexmorgan-dev',
    portfolio: 'https://alexmorgan.dev',
    otherLinks: []
  },
  summary: 'Performance-driven Full-Stack Software Engineer with 3+ years of experience designing, architecting, and deploying resilient web applications. Proven track record in developing high-throughput RESTful services, scalable React architectures, and optimizing relational/NoSQL databases.',
  skills: {
    programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'HTML5', 'CSS3'],
    frameworks: ['React', 'Node.js', 'Express.js', 'Next.js', 'Redux Toolkit'],
    databases: ['MongoDB', 'PostgreSQL', 'Redis'],
    cloud: ['Docker', 'AWS (S3, EC2)', 'CI/CD Pipelines', 'GitHub Actions'],
    tools: ['Git', 'Postman', 'Webpack', 'Vite', 'Jira', 'Linux'],
    softSkills: ['Agile / Scrum', 'Technical Leadership', 'Cross-Functional Collaboration', 'Code Review', 'System Design'],
    other: ['RESTful APIs', 'Microservices', 'Unit & Integration Testing', 'Jest']
  },
  experience: [
    {
      company: 'Apex Cloud Solutions',
      role: 'Full-Stack Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: 'Present',
      currentlyWorking: true,
      description: 'Lead engineer for customer-facing cloud analytics dashboard serving 45,000+ active enterprise users.',
      achievements: [
        'Engineered decoupled microservices in Node.js and Express, improving API response latency by 32%',
        'Designed modular React frontend components with client-side caching, reducing re-renders by 40%',
        'Implemented automated CI/CD pipeline using GitHub Actions and Docker, cutting deployment cycle from 2 hours to 15 minutes'
      ],
      technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis']
    },
    {
      company: 'DataStream Labs',
      role: 'Associate Software Developer',
      location: 'San Jose, CA',
      startDate: '2021-01',
      endDate: '2022-02',
      currentlyWorking: false,
      description: 'Contributed to high-volume telemetry data ingestion pipelines and internal tooling.',
      achievements: [
        'Developed REST endpoints for querying multi-gigabyte log archives, serving 200+ requests/sec',
        'Refactored MongoDB indexes, resulting in a 45% reduction in slow query timeouts'
      ],
      technologies: ['JavaScript', 'Python', 'MongoDB', 'Express', 'Git']
    }
  ],
  projects: [
    {
      name: 'TaskFlow Agile Platform',
      role: 'Creator & Lead Developer',
      description: 'Full-stack collaborative project management tool featuring real-time task board synchronization, role-based access control, and webhook notifications.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Docker'],
      projectUrl: 'https://taskflow-demo.io',
      githubUrl: 'https://github.com/alexmorgan-dev/taskflow',
      achievements: [
        'Architected real-time WebSocket communication layer handling concurrent updates without collisions',
        'Achieved 95% unit test coverage using Jest and Supertest'
      ]
    },
    {
      name: 'E-Commerce Analytics Engine',
      role: 'Full-Stack Developer',
      description: 'Microservice-based analytics dashboard processing checkout conversion funnels and transaction events.',
      technologies: ['TypeScript', 'React', 'PostgreSQL', 'Redis'],
      projectUrl: '',
      githubUrl: 'https://github.com/alexmorgan-dev/analytics-engine',
      achievements: ['Integrated Redis caching layer to support 10,000 requests/min with sub-50ms latency']
    }
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2017',
      endDate: '2021',
      cgpa: '3.8 / 4.0',
      description: 'Dean’s Honor List. Coursework in Algorithms, Operating Systems, Database Management, Distributed Systems.'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialUrl: 'https://aws.amazon.com/verification'
    }
  ],
  achievements: [
    {
      title: 'First Place - CalHacks Hackathon',
      description: 'Built an AI-assisted document parser in 36 hours competing against 250+ teams.',
      date: '2020'
    }
  ],
  languages: [
    { language: 'English', proficiency: 'Native' },
    { language: 'Spanish', proficiency: 'Intermediate' }
  ]
};

// @desc    Get master profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await Profile.create({
        user: req.user.id,
        personalInfo: {
          fullName: req.user.name,
          email: req.user.email
        }
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update master profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Merge provided fields
    const allowedFields = ['personalInfo', 'summary', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements', 'languages'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    profile.updatedAt = Date.now();
    await profile.save();

    await Activity.create({
      user: req.user.id,
      action: 'Updated Master Profile',
      type: 'profile',
      details: 'Saved edits to verified master profile.'
    });

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seed demo profile data
// @route   POST /api/profile/seed-demo
// @access  Private
exports.seedDemoProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    Object.assign(profile, DEMO_PROFILE_DATA);
    profile.user = req.user.id;
    profile.personalInfo.fullName = req.user.name || DEMO_PROFILE_DATA.personalInfo.fullName;
    profile.personalInfo.email = req.user.email || DEMO_PROFILE_DATA.personalInfo.email;

    await profile.save();

    await Activity.create({
      user: req.user.id,
      action: 'Loaded Demo Profile',
      type: 'profile',
      details: 'Populated Master Profile with realistic software engineer data.'
    });

    res.status(200).json({
      success: true,
      message: 'Demo profile data successfully loaded.',
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Improve summary with AI
// @route   POST /api/profile/improve-summary
// @access  Private
exports.improveSummaryWithAI = async (req, res, next) => {
  try {
    const { currentSummary, targetRole } = req.body;
    const profile = await Profile.findOne({ user: req.user.id });

    const skills = profile?.skills?.programmingLanguages?.concat(profile?.skills?.frameworks || []) || [];
    const skillsList = skills.slice(0, 5).join(', ');

    let enhanced = '';
    if (aiClient.isConfigured()) {
      const prompt = `Rewrite and polish the following professional summary for a ${targetRole || 'Software Engineer'} role. 
CRITICAL RULE: DO NOT FABRICATE any skills or companies. Use only verified skills: ${skillsList}.
Current summary: ${currentSummary || 'None provided.'}
Return JSON with { "summary": "polished summary here" }`;
      const result = await aiClient.generateJSON(prompt, 'You are an executive resume copywriter.');
      if (result && result.summary) {
        enhanced = result.summary;
      }
    }

    if (!enhanced) {
      enhanced = `Results-focused ${targetRole || 'Software Engineer'} with deep hands-on expertise in ${skillsList || 'modern web development'}. Proven record of engineering scalable, maintainable architectures and delivering high-performance features in collaborative cross-functional environments.`;
    }

    res.status(200).json({
      success: true,
      enhancedSummary: enhanced
    });
  } catch (err) {
    next(err);
  }
};
