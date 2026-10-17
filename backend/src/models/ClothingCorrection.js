const mongoose = require('mongoose');

// Records AI prediction vs user correction — can be used as future training data
const clothingCorrectionSchema = new mongoose.Schema({
  clothingItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attribute: {
    type: String,
    required: true,
    enum: ['category', 'subType', 'primaryColor', 'pattern', 'style', 'season', 'formality'],
  },
  predictedValue: {
    type: String,
    required: true,
  },
  correctedValue: {
    type: String,
    required: true,
  },
  aiConfidence: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ClothingCorrection', clothingCorrectionSchema);
