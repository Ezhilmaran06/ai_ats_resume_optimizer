const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  jobUrl: {
    type: String,
    default: ''
  },
  sourceType: {
    type: String,
    enum: ['pasted', 'uploaded_file', 'manual'],
    default: 'pasted'
  },
  rawText: {
    type: String,
    required: true
  },
  analysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAnalysis',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
