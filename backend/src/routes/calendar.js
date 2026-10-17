const express = require('express');
const { protect } = require('../middleware/auth');
const { getCalendar, logCalendarEntry } = require('../controllers/calendarController');

const router = express.Router();

router.use(protect);

router.get('/', getCalendar);
router.post('/', logCalendarEntry);

module.exports = router;
