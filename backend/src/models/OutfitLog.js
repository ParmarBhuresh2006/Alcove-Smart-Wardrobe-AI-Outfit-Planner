const mongoose = require('mongoose');

// Tracks what outfit was worn on each date — powers the calendar page
const outfitLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  outfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    default: null,
  },
  // Snapshot of clothing items (in case outfit is deleted)
  clothingItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
  }],
  date: {
    type: Date,
    required: true,
  },
  occasion: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  weather: {
    temperature: Number,
    condition: String,
  },
}, {
  timestamps: true,
});

// One log per user per date
outfitLogSchema.index({ userId: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('OutfitLog', outfitLogSchema);
