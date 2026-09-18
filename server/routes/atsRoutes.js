const express = require('express');
const { analyzeAts } = require('../controllers/atsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeAts);

module.exports = router;
