const mongoose = require('mongoose');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const Feedback = require('../models/Feedback');
const OutfitLog = require('../models/OutfitLog');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');
const { generateOutfitRecommendations } = require('../services/recommendationEngine');
const { buildImageUrl } = require('../utils/imageUrl');

// POST /api/outfits/recommend
async function recommend(req, res) {
  try {
    const { occasion, weather, location, count = 3 } = req.body;

    if (!occasion) {
      return res.status(400).json({ error: 'occasion is required.' });
    }

    // Load user's available wardrobe
    const wardrobe = await ClothingItem.find({
      userId: req.user._id,
      status: 'available',
    });

    if (wardrobe.length === 0) {
      return res.status(200).json({
        outfits: [],
        message: 'Your wardrobe is empty. Add some clothing items first.',
      });
    }

    // Build image URLs for each item
    const wardrobeWithUrls = wardrobe.map((item) => {
      const obj = item.toObject({ virtuals: true });
      obj.imageUrl = item.imagePath ? buildImageUrl(req, item.imagePath) : null;
      return obj;
    });

    const outfits = generateOutfitRecommendations({
      wardrobe: wardrobeWithUrls,
      occasion: occasion.toLowerCase(),
      weather: weather || {},
      location: location || '',
      count: parseInt(count, 10),
    });

    if (outfits.length === 0) {
      return res.status(200).json({
        outfits: [],
        message: 'Not enough clothing combinations in your wardrobe for this occasion. Try adding more items.',
      });
    }

    return res.json({ outfits });
  } catch (err) {
    logger.error(`recommend error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
}

// GET /api/outfits
async function listOutfits(req, res) {
  try {
    const outfits = await Outfit.find({ userId: req.user._id, isSaved: true })
      .populate('clothingItems')
      .sort({ createdAt: -1 });

    const result = outfits.map((o) => formatOutfit(req, o));
    return res.json({ outfits: result });
  } catch (err) {
    logger.error(`listOutfits error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve outfits.' });
  }
}

// POST /api/outfits
async function saveOutfit(req, res) {
  try {
    const { clothingItemIds, occasion, weather, location, score, scoreBreakdown, reasons, name } = req.body;

    if (!clothingItemIds || clothingItemIds.length === 0) {
      return res.status(400).json({ error: 'clothingItemIds is required.' });
    }

    // Extract valid string ObjectIds
    const rawIds = Array.isArray(clothingItemIds) ? clothingItemIds : [clothingItemIds];
    const validItemIds = rawIds
      .map((id) => {
        if (!id) return null;
        if (typeof id === 'object') return (id._id || id.id || id).toString();
        return String(id);
      })
      .filter((id) => id && id !== '[object Object]' && mongoose.Types.ObjectId.isValid(id));

    if (validItemIds.length === 0) {
      return res.status(400).json({ error: 'No valid clothing item IDs provided.' });
    }

    // Clean scoreBreakdown to fit model schema
    const cleanedBreakdown = {
      weather: Number(scoreBreakdown?.weather) || 0,
      occasion: Number(scoreBreakdown?.occasion) || 0,
      color: Number(scoreBreakdown?.color) || 0,
      style: Number(scoreBreakdown?.style) || 0,
      season: Number(scoreBreakdown?.season) || 0,
    };

    const outfit = await Outfit.create({
      userId: req.user._id,
      name: name || '',
      clothingItems: validItemIds,
      occasion: occasion || 'casual',
      weather: weather || {},
      location: location || '',
      score: Number(score) || 0,
      scoreBreakdown: cleanedBreakdown,
      reasons: Array.isArray(reasons) ? reasons : [],
      isSaved: true,
    });

    await outfit.populate('clothingItems');
    return res.status(201).json(formatOutfit(req, outfit));
  } catch (err) {
    logger.error(`saveOutfit error: ${err.message}`);
    return res.status(500).json({ error: `Failed to save outfit: ${err.message}` });
  }
}

// GET /api/outfits/:id
async function getOutfit(req, res) {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user._id }).populate('clothingItems');
    if (!outfit) return res.status(404).json({ error: 'Outfit not found.' });
    return res.json(formatOutfit(req, outfit));
  } catch (err) {
    logger.error(`getOutfit error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve outfit.' });
  }
}

// DELETE /api/outfits/:id
async function deleteOutfit(req, res) {
  try {
    const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!outfit) return res.status(404).json({ error: 'Outfit not found.' });
    return res.json({ message: 'Outfit deleted.' });
  } catch (err) {
    logger.error(`deleteOutfit error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete outfit.' });
  }
}

// POST /api/outfits/:id/wear
async function wearOutfit(req, res) {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user._id }).populate('clothingItems');
    if (!outfit) return res.status(404).json({ error: 'Outfit not found.' });

    const now = new Date();
    outfit.wornDate = now;
    await outfit.save();

    // Update wornCount and lastWorn for each valid clothing item
    const validItems = (outfit.clothingItems || []).filter((item) => item && item._id);

    for (const item of validItems) {
      await ClothingItem.findByIdAndUpdate(item._id, {
        $inc: { wornCount: 1 },
        lastWorn: now,
      });
    }

    // Create calendar log entry
    await OutfitLog.create({
      userId: req.user._id,
      outfitId: outfit._id,
      clothingItems: validItems.map((i) => i._id),
      date: now,
      occasion: outfit.occasion,
    });

    return res.json({ message: 'Outfit marked as worn.', wornDate: now });
  } catch (err) {
    logger.error(`wearOutfit error: ${err.message}`);
    return res.status(500).json({ error: `Failed to mark outfit as worn: ${err.message}` });
  }
}

// POST /api/outfits/:id/feedback
async function submitFeedback(req, res) {
  try {
    const { vote, reason, source } = req.body;
    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ error: 'vote must be "up" or "down".' });
    }

    // Allow anonymous feedback (for shared outfit page)
    const feedback = await Feedback.create({
      userId: req.user?._id || null,
      outfitId: req.params.id,
      vote,
      reason: reason || '',
      source: source || 'generator',
    });

    return res.status(201).json(feedback);
  } catch (err) {
    logger.error(`submitFeedback error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to submit feedback.' });
  }
}

// GET /api/outfits/share/:shareId  — public, no auth
async function getSharedOutfit(req, res) {
  try {
    const outfit = await Outfit.findOne({ shareId: req.params.shareId, isShared: true }).populate('clothingItems');
    if (!outfit) return res.status(404).json({ error: 'Shared outfit not found.' });
    return res.json(formatOutfit(req, outfit));
  } catch (err) {
    logger.error(`getSharedOutfit error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve shared outfit.' });
  }
}

// POST /api/outfits/:id/share
async function shareOutfit(req, res) {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!outfit) return res.status(404).json({ error: 'Outfit not found.' });

    if (!outfit.shareId) {
      outfit.shareId = uuidv4();
    }
    outfit.isShared = true;
    await outfit.save();

    return res.json({ shareId: outfit.shareId, shareUrl: `${req.protocol}://${req.get('host')}/share/${outfit.shareId}` });
  } catch (err) {
    logger.error(`shareOutfit error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to share outfit.' });
  }
}

function formatOutfit(req, outfit) {
  const obj = outfit.toObject ? outfit.toObject() : outfit;
  if (obj.clothingItems) {
    obj.clothingItems = obj.clothingItems.map((item) => {
      if (item && item.imagePath) {
        item.imageUrl = buildImageUrl(req, item.imagePath);
      }
      return item;
    });
  }
  return obj;
}

module.exports = { recommend, listOutfits, saveOutfit, getOutfit, deleteOutfit, wearOutfit, submitFeedback, getSharedOutfit, shareOutfit };
