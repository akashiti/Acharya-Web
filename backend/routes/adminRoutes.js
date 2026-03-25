const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly); // All admin routes require admin

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
