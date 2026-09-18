const express = require('express');
const { getSkillGapRoadmap } = require('../controllers/skillsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/gap-roadmap', getSkillGapRoadmap);

module.exports = router;
