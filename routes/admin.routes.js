const express = require('express');
const { getDashboardStats, getAllUsers, getAllCourses, getAllEnrollments, getAllFeedback, toggleUserActiveStatus, getEnrollmentStats } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/dashboard').get(protect, authorize('admin'), getDashboardStats);
router.route('/users').get(protect, authorize('admin'), getAllUsers);
router.route('/courses').get(protect, authorize('admin'), getAllCourses);
router.route('/enrollments').get(protect, authorize('admin'), getAllEnrollments);
router.route('/feedback').get(protect, authorize('admin'), getAllFeedback);
router.route('/users/:id/toggle-active').put(protect, authorize('admin'), toggleUserActiveStatus);
router.route('/stats/enrollment').get(protect, authorize('admin'), getEnrollmentStats);

module.exports = router;