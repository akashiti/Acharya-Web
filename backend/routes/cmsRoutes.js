const express = require('express');
const router = express.Router();
const {
  getBanners, createBanner, updateBanner, deleteBanner,
  getContent, getAllContent, upsertContent,
} = require('../controllers/cmsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/banners', getBanners);
router.get('/content', getAllContent);
router.get('/content/:section', getContent);

// Admin
router.post('/banners', protect, adminOnly, createBanner);
router.put('/banners/:id', protect, adminOnly, updateBanner);
router.delete('/banners/:id', protect, adminOnly, deleteBanner);
router.put('/content/:section', protect, adminOnly, upsertContent);

module.exports = router;
