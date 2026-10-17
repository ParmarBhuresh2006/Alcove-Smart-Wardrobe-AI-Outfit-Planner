const express = require('express');
const { protect } = require('../middleware/auth');
const {
  recommend, listOutfits, saveOutfit, getOutfit, deleteOutfit,
  wearOutfit, submitFeedback, getSharedOutfit, shareOutfit,
} = require('../controllers/outfitController');

const router = express.Router();

// Public route — shared outfit page (no auth required)
router.get('/share/:shareId', getSharedOutfit);
router.post('/share/:shareId/feedback', submitFeedback);

// Protected routes
router.use(protect);

router.post('/recommend', recommend);
router.get('/', listOutfits);
router.post('/', saveOutfit);
router.get('/:id', getOutfit);
router.delete('/:id', deleteOutfit);
router.post('/:id/wear', wearOutfit);
router.post('/:id/feedback', submitFeedback);
router.post('/:id/share', shareOutfit);

module.exports = router;
