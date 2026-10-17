const express = require('express');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { analyzeClothing, confirmAnalysis } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

// Upload image → AI analysis (returns predictions, does NOT save to wardrobe)
router.post('/analyze', upload.single('image'), handleUploadError, analyzeClothing);

// User confirms/corrects AI predictions → saves to wardrobe
router.post('/confirm', confirmAnalysis);

module.exports = router;
