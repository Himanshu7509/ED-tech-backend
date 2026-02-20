const express = require('express');
const { getFeedback, getFeedbackByCourse, getFeedbackById, submitFeedback, updateFeedback, deleteFeedback } = require('../controllers/feedback.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getFeedback).post(protect, submitFeedback);
router.route('/:id').get(getFeedbackById).put(protect, updateFeedback).delete(protect, authorize('admin'), deleteFeedback);
router.route('/course/:courseId').get(getFeedbackByCourse);

module.exports = router;