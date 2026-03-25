const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getAll);

// Admin
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
