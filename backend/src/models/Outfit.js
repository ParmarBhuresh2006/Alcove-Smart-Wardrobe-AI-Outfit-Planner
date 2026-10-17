const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    default: '',
  },
  clothingItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
  }],
  // Context when outfit was generated
  occasion: {
    type: String,
    default: 'casual',
  },
  weather: {
    temperature: { type: Number, default: null },
    condition: { type: String, default: null },
    humidity: { type: Number, default: null },
    rain: { type: Boolean, default: false },
  },
  location: {
    type: String,
    default: '',
  },
  // Scoring
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  scoreBreakdown: {
    weather: { type: Number, default: 0 },
    occasion: { type: Number, default: 0 },
    color: { type: Number, default: 0 },
    style: { type: Number, default: 0 },
    season: { type: Number, default: 0 },
  },
  reasons: {
    type: [String],
    default: [],
  },
  // User actions
  isSaved: {
    type: Boolean,
    default: false,
  },
  wornDate: {
    type: Date,
    default: null,
  },
  // Sharing
  shareId: {
    type: String,
    index: { unique: true, sparse: true },
  },
  isShared: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Outfit = mongoose.model('Outfit', outfitSchema);

// Drop legacy shareId_1 index if it indexed null values
Outfit.collection.dropIndex('shareId_1').catch(() => {
  // Ignore error if index does not exist
});

module.exports = Outfit;
