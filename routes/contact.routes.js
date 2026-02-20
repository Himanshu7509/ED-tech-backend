const express = require('express');
const { submitContactForm, getContacts, getContact, updateContact, deleteContact, getUnreadContactsCount } = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(submitContactForm).get(protect, authorize('admin'), getContacts);
router.route('/:id').get(protect, authorize('admin'), getContact)
  .put(protect, authorize('admin'), updateContact)
  .delete(protect, authorize('admin'), deleteContact);
router.route('/unread/count').get(protect, authorize('admin'), getUnreadContactsCount);

module.exports = router;