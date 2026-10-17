const mongoose = require('mongoose');

// Stores user feedback on outfit (used for SharedOutfit page and Lookbook)
const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // may be anonymous for shared page
  },
  outfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true,
  },
  vote: {
    type: String,
    enum: ['up', 'down'],
    required: true,
  },
  reason: {
    type: String,
    default: '',
    maxlength: 500,
  },
  source: {
    type: String,
    enum: ['lookbook', 'share', 'generator'],
    default: 'generator',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Feedback', feedbackSchema);
