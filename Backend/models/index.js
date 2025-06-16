// backend/models/index.js
const mongoose = require('mongoose');

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  codeforcesHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  currentRating: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRating: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  reminderCount: {
    type: Number,
    default: 0,
    min: 0
  },
  disableEmail: {
    type: Boolean,
    default: false
  },
  rank: {
    type: String,
    default: 'Unrated'
  },
  avatar: {
    type: String,
    default: ''
  },
  lastSubmissionTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting rating color (Note: Frontend also has its own color logic for consistency)
studentSchema.virtual('ratingColor').get(function() {
  const rating = this.currentRating;
  if (rating >= 3000) return '#FF0000'; // Legendary Grandmaster
  if (rating >= 2600) return '#FF0000'; // International Grandmaster
  if (rating >= 2400) return '#FF8C00'; // Grandmaster
  if (rating >= 2300) return '#AA00AA'; // International Master
  if (rating >= 2100) return '#0000FF'; // Master
  if (rating >= 1900) return '#00AAAA'; // Candidate Master
  if (rating >= 1600) return '#00AA00'; // Expert
  if (rating >= 1400) return '#AAAA00'; // Specialist
  if (rating >= 1200) return '#888888'; // Pupil
  return '#808080'; // Newbie/Unrated
});

// Contest Schema
const contestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  contestId: {
    type: Number,
    required: true
  },
  contestName: {
    type: String,
    required: true,
    trim: true
  },
  rank: {
    type: Number,
    required: true,
    min: 1
  },
  oldRating: {
    type: Number,
    required: true,
    min: 0
  },
  newRating: {
    type: Number,
    required: true,
    min: 0
  },
  ratingChange: {
    type: Number,
    required: true
  },
  ratingUpdateTimeSeconds: {
    type: Number,
    required: true
  },
  contestType: {
    type: String,
    default: 'CF'
  }
}, {
  timestamps: true
});

// Submission Schema
const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submissionId: {
    type: Number,
    required: true,
    unique: true
  },
  contestId: {
    type: Number,
    required: true
  },
  problem: {
    contestId: Number,
    index: String,
    name: String,
    type: String,
    points: Number,
    rating: Number,
    tags: [String]
  },
  author: {
    type: String,
    required: true
  },
  programmingLanguage: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    required: true
  },
  testset: {
    type: String,
    default: 'TESTS'
  },
  passedTestCount: {
    type: Number,
    default: 0
  },
  timeConsumedMillis: {
    type: Number,
    default: 0
  },
  memoryConsumedBytes: {
    type: Number,
    default: 0
  },
  creationTimeSeconds: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Problem Solved Schema (for quick lookups of solved problems)
const problemSolvedSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  problemName: {
    type: String,
    required: true
  },
  problemRating: {
    type: Number,
    default: 0
  },
  tags: [String],
  solvedAt: {
    type: Date,
    required: true
  },
  language: String,
  verdict: String
}, {
  timestamps: true
});

// Config Schema
const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better performance
studentSchema.index({ codeforcesHandle: 1 });
studentSchema.index({ email: 1 });
contestSchema.index({ student: 1, contestId: 1 });
submissionSchema.index({ student: 1, creationTimeSeconds: -1 });
submissionSchema.index({ submissionId: 1 });
problemSolvedSchema.index({ student: 1, solvedAt: -1 });

// Models
const Student = mongoose.model('Student', studentSchema);
const Contest = mongoose.model('Contest', contestSchema);
const Submission = mongoose.model('Submission', submissionSchema);
const ProblemSolved = mongoose.model('ProblemSolved', problemSolvedSchema);
const Config = mongoose.model('Config', configSchema);

module.exports = {
  Student,
  Contest,
  Submission,
  ProblemSolved,
  Config
};