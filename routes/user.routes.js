const express = require('express');
const { getProfile, updateProfile, getUsers, getUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/multerConfig');

const router = express.Router();

// Re-route into other resource routers
const courseRouter = require('./course.routes');

router.use('/:userId/courses', courseRouter);

router.route('/profile').get(protect, getProfile).put(protect, upload.single('photo'), updateProfile);
router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/:id').get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;