const express = require('express');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  listItems, getItem, createItem, updateItem, deleteItem, updateStatus, analyzeWardrobe,
} = require('../controllers/wardrobeController');

const router = express.Router();

router.use(protect);

router.get('/analysis', analyzeWardrobe);
router.get('/', listItems);
router.get('/:id', getItem);
router.post('/', upload.single('image'), handleUploadError, createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.put('/:id/status', updateStatus);

module.exports = router;
