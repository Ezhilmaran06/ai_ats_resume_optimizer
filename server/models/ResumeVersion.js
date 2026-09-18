const mongoose = require('mongoose');

const ResumeVersionSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: 'Version snapshot'
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

module.exports = mongoose.model('ResumeVersion', ResumeVersionSchema);
