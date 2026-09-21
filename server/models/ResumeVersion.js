const mongoose = require('mongoose');

const ResumeVersionSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  versionNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  template: {
    type: String,
    default: 'ats-classic'
  },
  note: {
    type: String,
    default: 'Version snapshot'
  },
  sections: {
    type: mongoose.Schema.Types.Mixed
  },
  snapshot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  atsScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ResumeVersionSchema.pre('save', function(next) {
  if (this.name && !this.title) this.title = this.name;
  if (this.title && !this.name) this.name = this.title;
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.resume && !this.resumeId) this.resumeId = this.resume;
  if (this.resumeId && !this.resume) this.resume = this.resumeId;
  if (this.snapshot && !this.sections) this.sections = this.snapshot.sections || this.snapshot;
  next();
});

module.exports = mongoose.model('ResumeVersion', ResumeVersionSchema);
