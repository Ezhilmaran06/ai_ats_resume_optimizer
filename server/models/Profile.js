const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    cgpa: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  skills: {
    programmingLanguages: [{ type: String }],
    frameworks: [{ type: String }],
    databases: [{ type: String }],
    cloud: [{ type: String }],
    tools: [{ type: String }],
    softSkills: [{ type: String }],
    other: [{ type: String }]
  },
  experience: [{
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, default: '' },
    achievements: [{ type: String }],
    technologies: [{ type: String }]
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    role: { type: String, default: '' },
    projectUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    achievements: [{ type: String }]
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, default: '' },
    credentialUrl: { type: String, default: '' }
  }],
  achievements: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: String, default: '' }
  }],
  languages: [{
    language: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ['Native', 'Fluent', 'Professional', 'Intermediate', 'Elementary'],
      default: 'Professional'
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
