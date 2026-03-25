const express = require('express');
const router = express.Router();
const { getAll, adminGetAll, getBySlug, getById, create, update, remove } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getAll);
router.get('/slug/:slug', getBySlug);

// Admin
router.get('/admin', protect, adminOnly, adminGetAll);
router.get('/admin/:id', protect, adminOnly, getById);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
