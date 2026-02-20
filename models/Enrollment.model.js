const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  }],
  certificateIssued: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true }); // Prevent duplicate enrollment

module.exports = mongoose.model('Enrollment', enrollmentSchema);