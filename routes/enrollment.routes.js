const express = require('express');
const { enrollInCourse, getMyEnrollments, getAllEnrollments, getEnrollment, updateEnrollment, deleteEnrollment, updateProgress } = require('../controllers/enrollment.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/my-enrollments').get(protect, getMyEnrollments);
router.route('/').post(protect, enrollInCourse).get(protect, authorize('admin'), getAllEnrollments);
router.route('/:id').get(protect, authorize('admin'), getEnrollment)
  .put(protect, authorize('admin'), updateEnrollment)
  .delete(protect, deleteEnrollment);
router.route('/:id/progress').put(protect, updateProgress);

module.exports = router;