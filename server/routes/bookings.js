const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAssignedBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('household'), createBooking);
router.get('/my', protect, authorize('household'), getMyBookings);
router.get('/assigned', protect, authorize('helper'), getAssignedBookings);
router.patch('/:id/status', protect, updateBookingStatus);

module.exports = router;
