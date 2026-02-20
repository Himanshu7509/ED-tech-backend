const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart.model');
const Course = require('../models/Course.model');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.course',
    select: 'title price thumbnail instructor'
  });

  if (!cart) {
    // Create empty cart if doesn't exist
    const newCart = await Cart.create({ user: req.user.id });
    return res.status(200).json({
      success: true,
      data: newCart
    });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add course to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { courseId, quantity } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`Course not found with id ${courseId}`, 404));
  }

  // Find or create user's cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
  }

  // Check if course is already in cart
  const existingItemIndex = cart.items.findIndex(item => 
    item.course.toString() === courseId
  );

  if (existingItemIndex > -1) {
    // Update quantity if course already exists in cart
    cart.items[existingItemIndex].quantity += quantity || 1;
  } else {
    // Add new course to cart
    cart.items.push({
      course: courseId,
      quantity: quantity || 1
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Find the item in the cart
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Cart item not found', 404));
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.items.pull(req.params.itemId);
  } else {
    // Update quantity
    item.quantity = quantity;
  }

  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Remove course from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Remove item from cart
  cart.items.pull(req.params.itemId);

  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Clear all items
  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Checkout
// @route   POST /api/v1/cart/checkout
// @access  Private
exports.checkout = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.course');

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  // In a real application, you would integrate with a payment gateway here
  // For now, we'll simulate a successful payment

  // Process each item in the cart (enroll user in courses)
  for (const item of cart.items) {
    // Check if user is already enrolled in this course
    const existingEnrollment = await require('../models/Enrollment.model').findOne({
      user: req.user.id,
      course: item.course._id
    });

    if (!existingEnrollment) {
      // Create enrollment
      await require('../models/Enrollment.model').create({
        user: req.user.id,
        course: item.course._id,
        paymentStatus: 'completed'
      });

      // Increment total students enrolled in course
      await Course.findByIdAndUpdate(item.course._id, {
        $inc: { totalStudentsEnrolled: 1 }
      });
    }
  }

  // Clear the cart after checkout
  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Checkout successful. Courses enrolled.',
    data: { cart }
  });
});

// @desc    Get cart total
// @route   GET /api/v1/cart/total
// @access  Private
exports.getCartTotal = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.course');

  if (!cart) {
    return res.status(200).json({
      success: true,
      total: 0,
      itemCount: 0
    });
  }

  let total = 0;
  let itemCount = 0;

  cart.items.forEach(item => {
    total += item.course.price * item.quantity;
    itemCount += item.quantity;
  });

  res.status(200).json({
    success: true,
    total,
    itemCount
  });
});