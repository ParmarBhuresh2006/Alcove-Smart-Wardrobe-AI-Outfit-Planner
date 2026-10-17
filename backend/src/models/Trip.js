const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  occasions: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
    default: '',
  },
  packingList: [{
    clothingItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingItem',
    },
    name: String,
    category: String,
    imageUrl: String,
    quantity: { type: Number, default: 1 },
    packed: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
  }],
  aiGenerated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Trip', tripSchema);
