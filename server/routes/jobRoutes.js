const express = require('express');
const {
  getJobs,
  getJobById,
  createAndAnalyzeJob,
  deleteJob,
  seedDemoJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getJobs)
  .post(upload.single('jobFile'), createAndAnalyzeJob);

router.post('/seed-demo', seedDemoJob);

router.route('/:id')
  .get(getJobById)
  .delete(deleteJob);

module.exports = router;
