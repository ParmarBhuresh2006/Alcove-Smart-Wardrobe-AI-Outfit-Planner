/**
 * aiService.js
 * Bridge between Node.js backend and the Python AI engine (Flask server).
 * The Python AI engine must be running at AI_ENGINE_URL (default: http://localhost:8000).
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const logger = require('../config/logger');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const TIMEOUT_MS = 30000; // 30 seconds

/**
 * Send an image file to the Python AI engine for analysis.
 * Returns a structured prediction object.
 *
 * @param {string} imagePath - Absolute path to the image file
 * @returns {Promise<Object>} prediction
 */
async function analyzeImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }

  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: 'image/jpeg',
  });

  logger.info(`Sending image to AI engine: ${AI_ENGINE_URL}/predict`);

  const response = await axios.post(`${AI_ENGINE_URL}/predict`, form, {
    headers: form.getHeaders(),
    timeout: TIMEOUT_MS,
  });

  return response.data;
}

/**
 * Check if the AI engine is healthy.
 * @returns {Promise<boolean>}
 */
async function checkAIHealth() {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 5000 });
    return response.data?.status === 'ok';
  } catch {
    return false;
  }
}

module.exports = { analyzeImage, checkAIHealth };
