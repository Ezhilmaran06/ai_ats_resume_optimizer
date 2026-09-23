const mongoose = require('mongoose');

const RequirementItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Programming Language', 'Programming Languages',
      'Framework', 'Frameworks',
      'Database', 'Databases',
      'Cloud', 'Cloud Technologies', 'Cloud & DevOps',
      'Tool', 'Tools',
      'Soft Skill', 'Soft Skills',
      'Qualification', 'Qualifications',
      'Experience', 'Technical', 'Other'
    ],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Required', 'Preferred', 'Optional'],
    default: 'Required'
  },
  importance: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  }
}, { _id: false });

const JobAnalysisSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  extractedRole: { type: String, default: '' },
  extractedCompany: { type: String, default: '' },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  programmingLanguages: [{ type: String }],
  frameworks: [{ type: String }],
  databases: [{ type: String }],
  cloudTechnologies: [{ type: String }],
  tools: [{ type: String }],
  softSkills: [{ type: String }],
  responsibilities: [{ type: String }],
  educationRequirements: [{ type: String }],
  experienceRequirements: [{ type: String }],
  certifications: [{ type: String }],
  domainKeywords: [{ type: String }],
  actionVerbs: [{ type: String }],
  requirementsTable: [RequirementItemSchema],
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('JobAnalysis', JobAnalysisSchema);
