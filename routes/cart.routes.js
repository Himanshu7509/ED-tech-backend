const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, checkout, getCartTotal } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/total').get(protect, getCartTotal);
router.route('/checkout').post(protect, checkout);
router.route('/:itemId').put(protect, updateCartItem).delete(protect, removeFromCart);

module.exports = router;