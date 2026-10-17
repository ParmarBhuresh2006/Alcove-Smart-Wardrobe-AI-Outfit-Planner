const path = require('path');
const fs = require('fs');
const ClothingItem = require('../models/ClothingItem');
const ClothingCorrection = require('../models/ClothingCorrection');
const logger = require('../config/logger');
const { buildImageUrl } = require('../utils/imageUrl');
const { analyzeImage } = require('../services/aiService');
const { computeWardrobeAnalysis } = require('../services/wardrobeAnalysis');

// GET /api/wardrobe
async function listItems(req, res) {
  try {
    const { category, status, style, color, search, wardrobeSpaceId } = req.query;
    const filter = { userId: req.user._id };

    if (category && category !== 'all') filter.category = category;
    if (status) filter.status = status;
    if (style) filter.style = style;
    if (color) filter.primaryColor = new RegExp(color, 'i');
    if (wardrobeSpaceId) filter.wardrobeSpaceId = wardrobeSpaceId;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { subType: new RegExp(search, 'i') },
        { primaryColor: new RegExp(search, 'i') },
      ];
    }

    const items = await ClothingItem.find(filter).sort({ createdAt: -1 });

    // Build full image URLs
    const result = items.map((item) => {
      const obj = item.toObject({ virtuals: true });
      obj.imageUrl = item.imagePath ? buildImageUrl(req, item.imagePath) : null;
      return obj;
    });

    return res.json({ items: result, total: result.length });
  } catch (err) {
    logger.error(`listItems error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve wardrobe items.' });
  }
}

// GET /api/wardrobe/analysis
async function analyzeWardrobe(req, res) {
  try {
    const items = await ClothingItem.find({ userId: req.user._id });
    const analysis = computeWardrobeAnalysis(items);
    return res.json(analysis);
  } catch (err) {
    logger.error(`analyzeWardrobe error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to analyze wardrobe.' });
  }
}

// GET /api/wardrobe/:id
async function getItem(req, res) {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const obj = item.toObject({ virtuals: true });
    obj.imageUrl = buildImageUrl(req, item.imagePath);
    return res.json(obj);
  } catch (err) {
    logger.error(`getItem error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve item.' });
  }
}

// POST /api/wardrobe
async function createItem(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const {
      name, category, subType, primaryColor, secondaryColors,
      pattern, style, season, formality, occasion, material,
      brand, notes, wardrobeSpaceId,
      aiConfidence, aiRaw, userVerified,
    } = req.body;

    const item = await ClothingItem.create({
      userId: req.user._id,
      wardrobeSpaceId: wardrobeSpaceId || 'home',
      name: name || '',
      imagePath: req.file.path,
      category: category || 'unknown',
      subType: subType || '',
      primaryColor: primaryColor || '',
      secondaryColors: secondaryColors ? (Array.isArray(secondaryColors) ? secondaryColors : [secondaryColors]) : [],
      pattern: pattern || 'unknown',
      style: style || 'unknown',
      season: season || 'all-year',
      formality: formality || 'unknown',
      occasion: occasion ? (Array.isArray(occasion) ? occasion : [occasion]) : [],
      material: material || '',
      brand: brand || '',
      notes: notes || '',
      aiConfidence: parseFloat(aiConfidence) || 0,
      aiRaw: aiRaw ? (typeof aiRaw === 'string' ? JSON.parse(aiRaw) : aiRaw) : null,
      userVerified: userVerified === 'true' || userVerified === true,
    });

    const obj = item.toObject({ virtuals: true });
    obj.imageUrl = buildImageUrl(req, item.imagePath);

    logger.info(`Wardrobe item created: ${item._id} for user ${req.user._id}`);
    return res.status(201).json(obj);
  } catch (err) {
    logger.error(`createItem error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to save clothing item.' });
  }
}

// PUT /api/wardrobe/:id
async function updateItem(req, res) {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const allowedFields = [
      'name', 'category', 'subType', 'primaryColor', 'secondaryColors',
      'pattern', 'style', 'season', 'formality', 'occasion', 'material',
      'brand', 'notes', 'status', 'wardrobeSpaceId', 'userVerified',
      'purchaseDate', 'wornCount', 'lastWorn',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Record corrections if user changed AI-predicted fields
    const aiFields = ['category', 'subType', 'primaryColor', 'pattern', 'style', 'season', 'formality'];
    for (const field of aiFields) {
      if (updates[field] && updates[field] !== item[field] && item.aiRaw) {
        await ClothingCorrection.create({
          clothingItemId: item._id,
          userId: req.user._id,
          attribute: field,
          predictedValue: item[field] || '',
          correctedValue: updates[field],
          aiConfidence: item.aiConfidence,
        });
      }
    }

    Object.assign(item, updates);
    if (updates.userVerified) item.userVerified = true;
    await item.save();

    const obj = item.toObject({ virtuals: true });
    obj.imageUrl = buildImageUrl(req, item.imagePath);
    return res.json(obj);
  } catch (err) {
    logger.error(`updateItem error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update clothing item.' });
  }
}

// DELETE /api/wardrobe/:id
async function deleteItem(req, res) {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    // Delete the image file
    if (item.imagePath && fs.existsSync(item.imagePath)) {
      fs.unlinkSync(item.imagePath);
    }

    await item.deleteOne();
    logger.info(`Wardrobe item deleted: ${req.params.id}`);
    return res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    logger.error(`deleteItem error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete item.' });
  }
}

// PUT /api/wardrobe/:id/status
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const valid = ['available', 'laundry', 'packed', 'donated'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${valid.join(', ')}` });
    }

    const item = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const obj = item.toObject({ virtuals: true });
    obj.imageUrl = buildImageUrl(req, item.imagePath);
    return res.json(obj);
  } catch (err) {
    logger.error(`updateStatus error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update item status.' });
  }
}

module.exports = { listItems, getItem, createItem, updateItem, deleteItem, updateStatus, analyzeWardrobe };
