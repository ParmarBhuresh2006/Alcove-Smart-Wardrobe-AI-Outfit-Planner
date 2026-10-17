const OutfitLog = require('../models/OutfitLog');
const ClothingItem = require('../models/ClothingItem');
const logger = require('../config/logger');
const { buildImageUrl } = require('../utils/imageUrl');

// GET /api/calendar?year=2026&month=2
async function getCalendar(req, res) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-based

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Fetch explicit OutfitLog entries
    const logs = await OutfitLog.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).populate('clothingItems').sort({ date: 1 });

    const entries = {};
    for (const log of logs) {
      const day = new Date(log.date).getDate();
      const items = (log.clothingItems || []).map((item) => {
        if (!item) return null;
        const obj = item.toObject ? item.toObject({ virtuals: true }) : item;
        obj.imageUrl = item.imagePath ? buildImageUrl(req, item.imagePath) : (item.imageUrl || null);
        return obj;
      }).filter(Boolean);

      entries[day] = {
        logId: log._id,
        outfitId: log.outfitId,
        date: log.date,
        occasion: log.occasion || 'Casual',
        notes: log.notes || '',
        weather: log.weather || {},
        items,
        image: items[0]?.imageUrl || null,
        category: items[0]?.category || 'Outfit',
        name: items[0]?.name || 'Worn Outfit',
      };
    }

    // 2. Fetch items where lastWorn falls in this month if day has no log
    const wornItems = await ClothingItem.find({
      userId: req.user._id,
      lastWorn: { $gte: start, $lte: end },
    });

    for (const item of wornItems) {
      const day = new Date(item.lastWorn).getDate();
      if (!entries[day]) {
        const obj = item.toObject ? item.toObject({ virtuals: true }) : item;
        obj.imageUrl = item.imagePath ? buildImageUrl(req, item.imagePath) : (item.imageUrl || null);
        entries[day] = {
          date: item.lastWorn,
          occasion: item.occasion?.[0] || item.style || 'Casual',
          notes: item.notes || `Wore ${item.name || item.category}`,
          items: [obj],
          image: obj.imageUrl,
          category: item.category,
          name: item.name || item.subType || item.category,
        };
      }
    }

    return res.json({
      year,
      month,
      daysInMonth: new Date(year, month, 0).getDate(),
      entries,
    });
  } catch (err) {
    logger.error(`getCalendar error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve calendar.' });
  }
}

// POST /api/calendar — log an outfit for a date
async function logCalendarEntry(req, res) {
  try {
    const { date, clothingItemIds, occasion, notes, weather, outfitId } = req.body;
    if (!date) return res.status(400).json({ error: 'date is required.' });

    const logDate = new Date(date);
    if (isNaN(logDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    const log = await OutfitLog.create({
      userId: req.user._id,
      outfitId: outfitId || null,
      clothingItems: clothingItemIds || [],
      date: logDate,
      occasion: occasion || '',
      notes: notes || '',
      weather: weather || {},
    });

    // Increment wornCount for each item
    if (clothingItemIds && clothingItemIds.length > 0) {
      await ClothingItem.updateMany(
        { _id: { $in: clothingItemIds }, userId: req.user._id },
        { $inc: { wornCount: 1 }, lastWorn: logDate }
      );
    }

    return res.status(201).json(log);
  } catch (err) {
    logger.error(`logCalendarEntry error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to log calendar entry.' });
  }
}

module.exports = { getCalendar, logCalendarEntry };
