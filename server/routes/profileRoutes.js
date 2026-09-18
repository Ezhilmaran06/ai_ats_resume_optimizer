const express = require('express');
const { getProfile, updateProfile, seedDemoProfile, improveSummaryWithAI } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.post('/seed-demo', seedDemoProfile);
router.post('/improve-summary', improveSummaryWithAI);

module.exports = router;
