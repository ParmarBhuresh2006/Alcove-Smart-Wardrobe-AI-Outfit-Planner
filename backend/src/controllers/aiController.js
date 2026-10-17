const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');
const { analyzeImage } = require('../services/aiService');
const ClothingItem = require('../models/ClothingItem');
const ClothingCorrection = require('../models/ClothingCorrection');
const { buildImageUrl, UPLOAD_DIR } = require('../utils/imageUrl');

// POST /api/ai/analyze
// Accepts an uploaded image, sends it to the Python AI engine, returns predictions
async function analyzeClothing(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required for analysis.' });
    }

    const imagePath = req.file.path;
    logger.info(`AI analyze request: ${imagePath}`);

    let prediction;
    try {
      prediction = await analyzeImage(imagePath);
    } catch (aiError) {
      logger.error(`AI engine error: ${aiError.message}`);

      // Return a clear error — do not fake predictions
      return res.status(503).json({
        error: 'AI engine is unavailable. Please start the AI engine (python ai-engine/server.py) and try again.',
        aiEngineDown: true,
      });
    }

    // Build image URL
    const imageUrl = buildImageUrl(req, imagePath);

    logger.info(`AI prediction complete — category: ${prediction.category?.value}, confidence: ${prediction.category?.confidence}`);

    return res.json({
      imagePath,
      imageUrl,
      prediction,
      needsReview: (prediction.category?.confidence || 0) < 0.60,
    });
  } catch (err) {
    logger.error(`analyzeClothing error: ${err.message}`);
    return res.status(500).json({ error: 'AI analysis failed.' });
  }
}

// POST /api/ai/confirm
// User confirms or corrects AI prediction — saves clothing item + corrections
async function confirmAnalysis(req, res) {
  try {
    const {
      imagePath,
      name, category, subType, primaryColor, secondaryColors,
      pattern, style, season, formality, material,
      aiPrediction, aiConfidence, wardrobeSpaceId,
    } = req.body;

    if (!imagePath) {
      return res.status(400).json({ error: 'imagePath is required.' });
    }

    // Verify file exists and belongs to this user (simple path check)
    const normalizedPath = path.resolve(imagePath);
    const uploadsDir = path.resolve(UPLOAD_DIR);
    if (!normalizedPath.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'Invalid image path.' });
    }

    const item = await ClothingItem.create({
      userId: req.user._id,
      wardrobeSpaceId: wardrobeSpaceId || 'home',
      name: name || '',
      imagePath,
      category: category || 'unknown',
      subType: subType || '',
      primaryColor: primaryColor || '',
      secondaryColors: Array.isArray(secondaryColors) ? secondaryColors : (secondaryColors ? [secondaryColors] : []),
      pattern: pattern || 'unknown',
      style: style || 'unknown',
      season: season || 'all-year',
      formality: formality || 'unknown',
      material: material || '',
      aiConfidence: parseFloat(aiConfidence) || 0,
      aiRaw: aiPrediction || null,
      userVerified: true,
    });

    // Record corrections for any field that differs from AI prediction
    if (aiPrediction) {
      const correctionFields = ['category', 'subType', 'primaryColor', 'pattern', 'style', 'season', 'formality'];
      const corrections = [];
      for (const field of correctionFields) {
        const predicted = aiPrediction[field]?.value || aiPrediction[field];
        const confirmed = req.body[field];
        if (predicted && confirmed && predicted !== confirmed) {
          corrections.push({
            clothingItemId: item._id,
            userId: req.user._id,
            attribute: field,
            predictedValue: String(predicted),
            correctedValue: String(confirmed),
            aiConfidence: parseFloat(aiConfidence) || 0,
          });
        }
      }
      if (corrections.length > 0) {
        await ClothingCorrection.insertMany(corrections);
        logger.info(`Recorded ${corrections.length} AI correction(s) for item ${item._id}`);
      }
    }

    const imageUrl = buildImageUrl(req, imagePath);
    const obj = item.toObject({ virtuals: true });
    obj.imageUrl = imageUrl;

    logger.info(`Clothing item confirmed and saved: ${item._id}`);
    return res.status(201).json(obj);
  } catch (err) {
    logger.error(`confirmAnalysis error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to save clothing item.' });
  }
}

module.exports = { analyzeClothing, confirmAnalysis };
