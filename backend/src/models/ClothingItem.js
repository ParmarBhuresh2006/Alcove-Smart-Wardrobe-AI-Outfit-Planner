const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  wardrobeSpaceId: {
    type: String,
    default: 'home',
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  imagePath: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  // AI-detected attributes
  category: {
    type: String,
    enum: ['tops', 'bottoms', 'outerwear', 'shoes', 'dresses', 'accessories', 'one-piece', 'unknown'],
    default: 'unknown',
  },
  subType: {
    type: String,
    default: '',
  },
  primaryColor: {
    type: String,
    default: '',
  },
  secondaryColors: {
    type: [String],
    default: [],
  },
  pattern: {
    type: String,
    enum: ['solid', 'striped', 'printed', 'knit', 'checked', 'floral', 'geometric', 'other', 'unknown'],
    default: 'unknown',
  },
  style: {
    type: String,
    enum: ['casual', 'formal', 'sporty', 'streetwear', 'business', 'party', 'minimal', 'vintage', 'traditional', 'unknown'],
    default: 'unknown',
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'all-year', 'unknown'],
    default: 'all-year',
  },
  material: {
    type: String,
    default: '',
  },
  formality: {
    type: String,
    enum: ['casual', 'smart-casual', 'formal', 'unknown'],
    default: 'unknown',
  },
  occasion: {
    type: [String],
    default: [],
  },
  // AI confidence
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  aiRaw: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  // User confirmation
  userVerified: {
    type: Boolean,
    default: false,
  },
  // Wear tracking
  status: {
    type: String,
    enum: ['available', 'laundry', 'packed', 'donated'],
    default: 'available',
  },
  wornCount: {
    type: Number,
    default: 0,
  },
  lastWorn: {
    type: Date,
    default: null,
  },
  brand: {
    type: String,
    default: '',
  },
  purchaseDate: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

clothingItemSchema.virtual('lastWornText').get(function () {
  if (!this.lastWorn) return 'Never';
  const diff = Date.now() - new Date(this.lastWorn).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  return 'over a year ago';
});

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
