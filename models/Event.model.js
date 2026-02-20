const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  eventDate: {
    type: Date,
    required: [true, 'Please add an event date']
  },
  eventTime: {
    type: String, // e.g. "10:00 AM", "2:30 PM"
    required: [true, 'Please add an event time']
  },
  eventType: {
    type: String,
    required: [true, 'Please add an event type'],
    enum: ['Webinar', 'Workshop', 'Seminar', 'Conference'],
    default: 'Webinar'
  },
  speaker: {
    type: String,
    required: [true, 'Please add a speaker name'],
    trim: true
  },
  banner: {
    type: String // Cloudinary URL
  },
  registrationLink: {
    type: String
  },
  seatsAvailable: {
    type: Number,
    default: 100
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);