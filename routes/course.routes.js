const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse, getCoursesByInstructor, uploadCourseThumbnail, getTopRatedCourses, getMostPopularCourses } = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../utils/advancedResults');
const Course = require('../models/Course.model');

const router = express.Router();

// Re-route into other resource routers
const reviewRouter = require('./review.routes');

router.use('/:courseId/reviews', reviewRouter);

router.route('/top').get(getTopRatedCourses);
router.route('/popular').get(getMostPopularCourses);
router.route('/:id/upload-thumbnail').put(protect, authorize('admin'), uploadCourseThumbnail);
router.route('/:instructorId/courses').get(getCoursesByInstructor);
router.route('/').get(advancedResults(Course, 'instructor'), getCourses).post(protect, authorize('admin'), addCourse);
router.route('/:id').get(getCourse).put(protect, authorize('admin'), updateCourse).delete(protect, authorize('admin'), deleteCourse);

module.exports = router;