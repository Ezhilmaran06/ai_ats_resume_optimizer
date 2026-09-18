const express = require('express');
const { analyzeMatching, optimizeResume, applySuggestions } = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeMatching);
router.post('/optimize', optimizeResume);
router.post('/apply-suggestions', applySuggestions);

module.exports = router;
