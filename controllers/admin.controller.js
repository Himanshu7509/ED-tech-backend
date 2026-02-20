const asyncHandler = require('express-async-handler');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Feedback = require('../models/Feedback.model');
const Contact = require('../models/Contact.model');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get counts for various entities
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalEnrollments = await Enrollment.countDocuments();
  const totalFeedback = await Feedback.countDocuments();
  const totalContacts = await Contact.countDocuments();
  
  // Get recent signups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSignups = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });
  
  // Get recent enrollments
  const recentEnrollments = await Enrollment.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });
  
  // Calculate total revenue (sum of course prices from completed enrollments)
  const completedEnrollments = await Enrollment.find({
    paymentStatus: 'completed'
  }).populate('course');
  
  const totalRevenue = completedEnrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.course ? enrollment.course.price : 0);
  }, 0);
  
  // Get top performing courses
  const topCourses = await Course.find()
    .sort({ totalStudentsEnrolled: -1 })
    .limit(5)
    .select('title category totalStudentsEnrolled price rating');
  
  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalFeedback,
      totalContacts,
      recentSignups,
      recentEnrollments,
      totalRevenue,
      topCourses
    }
  });
});

// @desc    Get all users with pagination
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const users = await User.find()
    .select('-password')
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await User.countDocuments();
  
  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: users
  });
});

// @desc    Get all courses with pagination
// @route   GET /api/v1/admin/courses
// @access  Private/Admin
exports.getAllCourses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const courses = await Course.find()
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Course.countDocuments();
  
  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: courses
  });
});

// @desc    Get all enrollments with pagination
// @route   GET /api/v1/admin/enrollments
// @access  Private/Admin
exports.getAllEnrollments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const enrollments = await Enrollment.find()
    .populate({
      path: 'user',
      select: 'fullName email'
    })
    .populate({
      path: 'course',
      select: 'title price'
    })
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Enrollment.countDocuments();
  
  res.status(200).json({
    success: true,
    count: enrollments.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: enrollments
  });
});

// @desc    Get all feedback with pagination
// @route   GET /api/v1/admin/feedback
// @access  Private/Admin
exports.getAllFeedback = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const feedback = await Feedback.find()
    .populate({
      path: 'user',
      select: 'fullName email'
    })
    .populate({
      path: 'course',
      select: 'title'
    })
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Feedback.countDocuments();
  
  res.status(200).json({
    success: true,
    count: feedback.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: feedback
  });
});

// @desc    Toggle user active status
// @route   PUT /api/v1/admin/users/:id/toggle-active
// @access  Private/Admin
exports.toggleUserActiveStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get enrollment statistics
// @route   GET /api/v1/admin/stats/enrollment
// @access  Private/Admin
exports.getEnrollmentStats = asyncHandler(async (req, res, next) => {
  // Total enrollments by month
  const monthlyStats = await Enrollment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] }
        }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  // Total enrollments by course
  const byCourse = await Enrollment.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    {
      $unwind: '$courseInfo'
    },
    {
      $group: {
        _id: {
          courseId: '$course',
          courseTitle: '$courseInfo.title'
        },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      monthlyStats,
      byCourse
    }
  });
});