const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getAllPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/create', protect, createPayment);
router.post('/verify', protect, verifyPayment);
router.get('/admin/all', protect, adminOnly, getAllPayments);

module.exports = router;
