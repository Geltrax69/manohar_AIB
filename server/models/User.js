const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  selectedLanguage: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  xp: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  badges: [{
    id: String,
    name: String,
    earnedAt: Date
  }],
  completedCourses: [{
    courseId: String,
    completedAt: Date
  }],
  completedLessons: [{
    lessonId: String,
    courseId: String,
    completedAt: Date
  }],
  learningPath: {
    goal: String,
    currentStep: Number,
    steps: [String]
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    fontSize: {
      type: Number,
      default: 14
    },
    keyboardShortcuts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
