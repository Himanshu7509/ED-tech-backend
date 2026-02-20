const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback.model');
const Course = require('../models/Course.model');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all feedback
// @route   GET /api/v1/feedback
// @access  Public
exports.getFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.find()
    .populate({
      path: 'user',
      select: 'fullName email'
    })
    .populate({
      path: 'course',
      select: 'title'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedback.length,
    data: feedback
  });
});

// @desc    Get feedback for a specific course
// @route   GET /api/v1/feedback/course/:courseId
// @access  Public
exports.getFeedbackByCourse = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.find({ course: req.params.courseId })
    .populate({
      path: 'user',
      select: 'fullName email'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedback.length,
    data: feedback
  });
});

// @desc    Get single feedback
// @route   GET /api/v1/feedback/:id
// @access  Public
exports.getFeedbackById = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'fullName email'
    })
    .populate({
      path: 'course',
      select: 'title'
    });

  if (!feedback) {
    return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: feedback
  });
});

// @desc    Submit feedback
// @route   POST /api/v1/feedback
// @access  Private
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { courseId, rating, comment } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`Course not found with id ${courseId}`, 404));
  }

  // Check if user has already submitted feedback for this course
  const existingFeedback = await Feedback.findOne({
    user: req.user.id,
    course: courseId
  });

  if (existingFeedback) {
    return next(new ErrorResponse('You have already submitted feedback for this course', 400));
  }

  // Create feedback
  const feedback = await Feedback.create({
    user: req.user.id,
    course: courseId,
    rating,
    comment
  });

  // Update course rating
  await Course.calculateAverageRating(courseId);

  res.status(201).json({
    success: true,
    data: feedback
  });
});

// @desc    Update feedback
// @route   PUT /api/v1/feedback/:id
// @access  Private
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  let feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
  }

  // Check if user is admin or the feedback owner
  if (req.user.role !== 'admin' && feedback.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this feedback', 401));
  }

  feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Update course rating after updating feedback
  await Course.calculateAverageRating(feedback.course);

  res.status(200).json({
    success: true,
    data: feedback
  });
});

// @desc    Delete feedback
// @route   DELETE /api/v1/feedback/:id
// @access  Private/Admin
exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
  }

  // Check if user is admin or the feedback owner
  if (req.user.role !== 'admin' && feedback.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this feedback', 401));
  }

  const courseId = feedback.course;

  await feedback.remove();

  // Update course rating after deleting feedback
  await Course.calculateAverageRating(courseId);

  res.status(200).json({
    success: true,
    data: {}
  });
});