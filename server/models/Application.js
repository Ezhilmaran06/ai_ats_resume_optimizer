const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
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
  salary: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Saved'
  },
  dateApplied: {
    type: Date,
    default: null
  },
  deadline: {
    type: Date,
    default: null
  },
  resumeUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  resumeTitle: {
    type: String,
    default: ''
  },
  atsScore: {
    type: Number,
    default: 0
  },
  jobUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
