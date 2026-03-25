const express = require('express');
const router = express.Router();
const {
  getJournals,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
} = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

// All journal routes require authentication
router.use(protect);

router.route('/').get(getJournals).post(createJournal);
router.route('/:id').get(getJournal).put(updateJournal).delete(deleteJournal);

module.exports = router;
