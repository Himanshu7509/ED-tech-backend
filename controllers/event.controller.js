const asyncHandler = require('express-async-handler');
const Event = require('../models/Event.model');
const ErrorResponse = require('../utils/ErrorResponse');
const cloudinary = require('cloudinary').v2;

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find({ isActive: true }).sort({ eventDate: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event || !event.isActive) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private/Admin
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Validate required fields
  const { title, description, eventDate, eventTime, eventType, speaker } = req.body;
  
  if (!title || !description || !eventDate || !eventTime || !eventType || !speaker) {
    return next(new ErrorResponse('Please provide all required fields: title, description, eventDate, eventTime, eventType, speaker', 400));
  }

  // Validate event type
  const validEventTypes = ['Webinar', 'Workshop', 'Seminar', 'Conference'];
  if (!validEventTypes.includes(eventType)) {
    return next(new ErrorResponse(`Invalid event type. Must be one of: ${validEventTypes.join(', ')}`, 400));
  }

  // Validate date format
  if (isNaN(Date.parse(eventDate))) {
    return next(new ErrorResponse('Invalid event date format. Please use ISO format (YYYY-MM-DD)', 400));
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private/Admin
exports.updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private/Admin
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  await event.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Register for an event
// @route   POST /api/v1/events/:id/register
// @access  Private
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event || !event.isActive) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  if (event.seatsAvailable <= 0) {
    return next(new ErrorResponse('No seats available for this event', 400));
  }

  // Check if user is already registered
  const isRegistered = event.registeredUsers.includes(req.user.id);
  if (isRegistered) {
    return next(new ErrorResponse('User is already registered for this event', 400));
  }

  // Add user to registered users
  event.registeredUsers.push(req.user.id);
  event.seatsAvailable -= 1;
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Successfully registered for the event',
    data: event
  });
});

// @desc    Upload event banner
// @route   PUT /api/v1/events/:id/upload-banner
// @access  Private/Admin
exports.uploadEventBanner = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.files && req.files.banner) {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.files.banner.tempFilePath, {
      folder: 'events',
      width: 800,
      crop: 'scale'
    });

    event.banner = result.secure_url;
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } else {
    return next(
      new ErrorResponse('Please upload a banner image', 400)
    );
  }
});

// @desc    Get user's registered events
// @route   GET /api/v1/events/my-events
// @access  Private
exports.getMyEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find({ 
    registeredUsers: { $in: [req.user.id] } 
  }).sort({ eventDate: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});