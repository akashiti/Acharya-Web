const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, adminGetAll, updateStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require auth

// User
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);

// Admin
router.get('/admin/all', adminOnly, adminGetAll);
router.put('/admin/:id/status', adminOnly, updateStatus);

module.exports = router;
