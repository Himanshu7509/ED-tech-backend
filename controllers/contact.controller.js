const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact.model');
const ErrorResponse = require('../utils/ErrorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit contact form
// @route   POST /api/v1/contacts
// @access  Public
exports.submitContactForm = asyncHandler(async (req, res, next) => {
  const { fullName, email, subject, description } = req.body;

  // Validate required fields
  if (!fullName || !email || !subject || !description) {
    return next(new ErrorResponse('Please provide all required fields: fullName, email, subject, description', 400));
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  // Validate field lengths
  if (fullName.length > 50) {
    return next(new ErrorResponse('Full name cannot be more than 50 characters', 400));
  }

  if (subject.length > 100) {
    return next(new ErrorResponse('Subject cannot be more than 100 characters', 400));
  }

  if (description.length > 1000) {
    return next(new ErrorResponse('Description cannot be more than 1000 characters', 400));
  }

  const contact = await Contact.create({
    fullName,
    email,
    subject,
    description
  });

  // Send notification email to admin
  try {
    await sendEmail({
      email: process.env.ADMIN_EMAIL || 'admin@edtech.com',
      subject: `New Contact Form Submission: ${subject}`,
      message: `A new contact form has been submitted:\n\nName: ${fullName}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${description}`
    });
  } catch (err) {
    // If email sending fails, log the error but don't fail the submission
    console.error('Email not sent:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Contact form submitted successfully',
    data: contact
  });
});

// @desc    Get all contacts
// @route   GET /api/v1/contacts
// @access  Private/Admin
exports.getContacts = asyncHandler(async (req, res, next) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts
  });
});

// @desc    Get single contact
// @route   GET /api/v1/contacts/:id
// @access  Private/Admin
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Update contact (mark as read)
// @route   PUT /api/v1/contacts/:id
// @access  Private/Admin
exports.updateContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: req.body.isRead !== undefined ? req.body.isRead : true },
    {
      new: true,
      runValidators: true
    }
  );

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/v1/contacts/:id
// @access  Private/Admin
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get unread contacts count
// @route   GET /api/v1/contacts/unread/count
// @access  Private/Admin
exports.getUnreadContactsCount = asyncHandler(async (req, res, next) => {
  const count = await Contact.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    count
  });
});