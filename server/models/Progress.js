const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: String,
  lessonId: String,
  completed: {
    type: Boolean,
    default: false
  },
  code: String,
  score: Number,
  timeSpent: Number,
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Progress', progressSchema)
