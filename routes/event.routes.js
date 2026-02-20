const express = require('express');
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, uploadEventBanner, getMyEvents } = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/multerConfig');

const router = express.Router();

router.route('/').get(getEvents).post(protect, authorize('admin'), createEvent);
router.route('/:id').get(getEvent).put(protect, authorize('admin'), updateEvent).delete(protect, authorize('admin'), deleteEvent);
router.route('/:id/register').post(protect, registerForEvent);
router.route('/:id/upload-banner').put(protect, authorize('admin'), upload.single('banner'), uploadEventBanner);
router.route('/my-events').get(protect, getMyEvents);

module.exports = router;