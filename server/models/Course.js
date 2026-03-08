const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  content: String,
  code: String,
  exercises: [{
    question: String,
    initialCode: String,
    solution: String,
    hints: [String]
  }],
  duration: Number,
  xpReward: Number
})

const courseSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  language: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  category: String,
  lessons: [lessonSchema],
  totalDuration: String,
  rating: Number,
  enrolledCount: {
    type: Number,
    default: 0
  },
  thumbnail: String,
  tags: [String]
}, {
  timestamps: true
})

module.exports = mongoose.model('Course', courseSchema)
