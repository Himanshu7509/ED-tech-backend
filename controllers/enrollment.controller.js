const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Enroll in a course
// @route   POST /api/v1/enrollments
// @access  Private
exports.enrollInCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`Course not found with id ${courseId}`, 404));
  }

  // Check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: req.user.id,
    course: courseId
  });

  if (existingEnrollment) {
    return next(new ErrorResponse('User is already enrolled in this course', 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    user: req.user.id,
    course: courseId
  });

  // Increment total students enrolled in course
  course.totalStudentsEnrolled += 1;
  await course.save();

  // Add course to user's enrolled courses
  await require('../models/User.model').findByIdAndUpdate(req.user.id, {
    $push: { enrolledCourses: courseId }
  });

  res.status(201).json({
    success: true,
    data: enrollment
  });
});

// @desc    Get user's enrolled courses
// @route   GET /api/v1/enrollments/my-enrollments
// @access  Private
exports.getMyEnrollments = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({ user: req.user.id })
    .populate({
      path: 'course',
      select: 'title category price thumbnail instructor rating'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

// @desc    Get all enrollments (Admin only)
// @route   GET /api/v1/enrollments
// @access  Private/Admin
exports.getAllEnrollments = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find()
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
    count: enrollments.length,
    data: enrollments
  });
});

// @desc    Get single enrollment
// @route   GET /api/v1/enrollments/:id
// @access  Private/Admin
exports.getEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'fullName email'
    })
    .populate({
      path: 'course',
      select: 'title'
    });

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

// @desc    Update enrollment (progress, etc.)
// @route   PUT /api/v1/enrollments/:id
// @access  Private/Admin
exports.updateEnrollment = asyncHandler(async (req, res, next) => {
  let enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id ${req.params.id}`, 404));
  }

  // Check if user is admin or the enrollment owner
  if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this enrollment', 401));
  }

  enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

// @desc    Delete enrollment (unenroll)
// @route   DELETE /api/v1/enrollments/:id
// @access  Private
exports.deleteEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id ${req.params.id}`, 404));
  }

  // Check if user is admin or the enrollment owner
  if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this enrollment', 401));
  }

  // Decrement total students enrolled in course
  const course = await Course.findById(enrollment.course);
  if (course) {
    course.totalStudentsEnrolled = Math.max(0, course.totalStudentsEnrolled - 1);
    await course.save();
  }

  // Remove course from user's enrolled courses
  await require('../models/User.model').findByIdAndUpdate(req.user.id, {
    $pull: { enrolledCourses: enrollment.course }
  });

  await enrollment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update course progress
// @route   PUT /api/v1/enrollments/:id/progress
// @access  Private
exports.updateProgress = asyncHandler(async (req, res, next) => {
  const { moduleId, lessonId } = req.body;

  let enrollment = await Enrollment.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!enrollment) {
    return next(new ErrorResponse('Enrollment not found', 404));
  }

  // Add completed lesson to the array if not already present
  const lessonExists = enrollment.completedLessons.some(lesson => 
    lesson.moduleId.toString() === moduleId && lesson.lessonId.toString() === lessonId
  );

  if (!lessonExists) {
    enrollment.completedLessons.push({
      moduleId,
      lessonId
    });
  }

  // Calculate progress percentage
  const course = await Course.findById(enrollment.course);
  let totalLessons = 0;
  let completedLessons = enrollment.completedLessons.length;

  // Count total lessons in the course curriculum
  course.courseCurriculum.forEach(module => {
    totalLessons += module.lessons.length;
  });

  if (totalLessons > 0) {
    enrollment.progress = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
  } else {
    enrollment.progress = 0;
  }

  // Check if course is completed
  if (enrollment.progress === 100) {
    enrollment.completedAt = Date.now();
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment
  });
});