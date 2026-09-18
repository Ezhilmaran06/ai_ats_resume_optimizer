const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Resume'
  },
  isMaster: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: String,
    enum: ['ats-classic', 'modern-pro', 'swe', 'fresh-grad', 'minimal', 'executive'],
    default: 'ats-classic'
  },
  targetRole: {
    type: String,
    default: ''
  },
  targetCompany: {
    type: String,
    default: ''
  },
  targetJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null
  },
  personalInfo: {
    fullName: { type: String, default: '' },
    professionalTitle: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    otherLinks: [{ label: String, url: String }]
  },
  summary: {
    type: String,
    default: ''
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    cgpa: String,
    description: String
  }],
  skills: {
    programmingLanguages: [String],
    frameworks: [String],
    databases: [String],
    cloud: [String],
    tools: [String],
    softSkills: [String],
    other: [String]
  },
  experience: [{
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    currentlyWorking: Boolean,
    description: String,
    achievements: [String],
    technologies: [String]
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    role: String,
    projectUrl: String,
    githubUrl: String,
    achievements: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    credentialUrl: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }],
  sectionOrder: {
    type: [String],
    default: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'languages']
  },
  formatting: {
    fontFamily: { type: String, default: 'Inter' },
    fontSize: { type: String, default: '10pt' },
    lineSpacing: { type: String, default: '1.2' },
    margins: { type: String, default: 'normal' }, // compact, normal, spacious
    accentColor: { type: String, default: '#2563EB' }
  },
  atsScore: {
    overallScore: { type: Number, default: 0 },
    categories: {
      keywordRelevance: { type: Number, default: 0 },
      skillsMatch: { type: Number, default: 0 },
      jobRelevance: { type: Number, default: 0 },
      structure: { type: Number, default: 0 },
      sectionCompleteness: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 }
    },
    lastAnalyzed: { type: Date, default: null }
  },
  versionNumber: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
