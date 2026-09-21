const express = require('express');
const {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  renameResume,
  uploadResume,
  recalculateResumeScore,
  exportDocx,
  exportTxt,
  compareVersions
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getResumes)
  .post(createResume);

router.post('/upload', upload.single('resumeFile'), uploadResume);

router.route('/:id')
  .get(getResumeById)
  .put(updateResume)
  .delete(deleteResume);

router.post('/:id/duplicate', duplicateResume);
router.put('/:id/rename', renameResume);
router.post('/:id/recalculate', recalculateResumeScore);
router.get('/:id/export/docx', exportDocx);
router.get('/:id/export/txt', exportTxt);
router.get('/:id/compare', compareVersions);

module.exports = router;
