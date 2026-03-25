const express = require('express');
const router = express.Router();
const { getCart, addItem, removeItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes require auth

router.get('/', getCart);
router.post('/', addItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeItem);

module.exports = router;
