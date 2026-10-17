const express = require('express');
const { protect } = require('../middleware/auth');
const { listTrips, createTrip, getTrip, updateTrip, deleteTrip } = require('../controllers/tripController');

const router = express.Router();

router.use(protect);

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
