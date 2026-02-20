const asyncHandler = require('express-async-handler');
const Course = require('../models/Course.model');
const ErrorResponse = require('../utils/ErrorResponse');
const cloudinary = require('cloudinary').v2;
const advancedResults = require('../utils/advancedResults');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'fullName email');

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private/Admin
exports.addCourse = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.instructor = req.user.id;

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private/Admin
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is course owner or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this course`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private/Admin
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is course owner or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this course`,
        401
      )
    );
  }

  // Soft delete - set isDeleted to true instead of removing from DB
  course.isDeleted = true;
  await course.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get courses by instructor
// @route   GET /api/v1/instructors/:instructorId/courses
// @access  Public
exports.getCoursesByInstructor = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ instructor: req.params.instructorId });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Upload course thumbnail
// @route   PUT /api/v1/courses/:id/upload-thumbnail
// @access  Private/Admin
exports.uploadCourseThumbnail = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is course owner or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this course`,
        401
      )
    );
  }

  if (req.files && req.files.thumbnail) {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
      folder: 'courses',
      width: 500,
      crop: 'scale'
    });

    course.thumbnail = result.secure_url;
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } else {
    return next(
      new ErrorResponse('Please upload a thumbnail image', 400)
    );
  }
});

// @desc    Get top-rated courses
// @route   GET /api/v1/courses/top
// @access  Public
exports.getTopRatedCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ isDeleted: false })
    .sort({ rating: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get most popular courses (by enrollment)
// @route   GET /api/v1/courses/popular
// @access  Public
exports.getMostPopularCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ isDeleted: false })
    .sort({ totalStudentsEnrolled: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
