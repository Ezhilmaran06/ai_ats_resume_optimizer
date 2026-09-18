const express = require('express');
const { generateQuestions, generatePitch } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/generate', generateQuestions);
router.post('/pitch', generatePitch);

module.exports = router;
