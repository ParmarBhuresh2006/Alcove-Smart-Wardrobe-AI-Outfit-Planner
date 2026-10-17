const Trip = require('../models/Trip');
const ClothingItem = require('../models/ClothingItem');
const logger = require('../config/logger');
const { buildImageUrl } = require('../utils/imageUrl');
const { generatePackingList } = require('../services/packingService');

// GET /api/trips
async function listTrips(req, res) {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ trips });
  } catch (err) {
    logger.error(`listTrips error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve trips.' });
  }
}

// POST /api/trips
async function createTrip(req, res) {
  try {
    const { destination, startDate, endDate, occasions, notes } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'destination, startDate, and endDate are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    // Get user's available wardrobe for packing suggestions
    const wardrobe = await ClothingItem.find({ userId: req.user._id, status: 'available' });
    const wardrobeWithUrls = wardrobe.map((item) => {
      const obj = item.toObject({ virtuals: true });
      obj.imageUrl = buildImageUrl(req, item.imagePath);
      return obj;
    });

    const days = Math.ceil((end - start) / 86400000) + 1;
    const packingList = generatePackingList({ wardrobe: wardrobeWithUrls, days, occasions: occasions || [] });

    const trip = await Trip.create({
      userId: req.user._id,
      destination,
      startDate: start,
      endDate: end,
      occasions: occasions || [],
      notes: notes || '',
      packingList,
      aiGenerated: packingList.length > 0,
    });

    return res.status(201).json(trip);
  } catch (err) {
    logger.error(`createTrip error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to create trip.' });
  }
}

// GET /api/trips/:id
async function getTrip(req, res) {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id }).populate('packingList.clothingItemId');
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    const obj = trip.toObject();
    obj.packingList = obj.packingList.map((p) => {
      if (p.clothingItemId?.imagePath) {
        p.imageUrl = buildImageUrl(req, p.clothingItemId.imagePath);
      }
      return p;
    });
    return res.json(obj);
  } catch (err) {
    logger.error(`getTrip error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve trip.' });
  }
}

// PUT /api/trips/:id
async function updateTrip(req, res) {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    const { destination, occasions, notes, packingList } = req.body;
    if (destination) trip.destination = destination;
    if (occasions) trip.occasions = occasions;
    if (notes !== undefined) trip.notes = notes;
    if (packingList) trip.packingList = packingList;

    await trip.save();
    return res.json(trip);
  } catch (err) {
    logger.error(`updateTrip error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update trip.' });
  }
}

// DELETE /api/trips/:id
async function deleteTrip(req, res) {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    return res.json({ message: 'Trip deleted.' });
  } catch (err) {
    logger.error(`deleteTrip error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
}

module.exports = { listTrips, createTrip, getTrip, updateTrip, deleteTrip };
