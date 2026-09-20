const express = require('express');
const {
  getProfile,
  updateProfile,
  addSectionItem,
  updateSectionItem,
  deleteSectionItem,
  reorderSectionItems,
  seedDemoProfile,
  improveSummaryWithAI
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

// Section CRUD & reordering endpoints
router.post('/section/:sectionName', addSectionItem);
router.put('/section/:sectionName/reorder', reorderSectionItems);
router.route('/section/:sectionName/:itemId')
  .put(updateSectionItem)
  .delete(deleteSectionItem);

router.post('/seed-demo', seedDemoProfile);
router.post('/improve-summary', improveSummaryWithAI);

module.exports = router;
