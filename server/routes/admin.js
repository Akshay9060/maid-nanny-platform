const express = require('express');
const {
  getPendingHelpers,
  verifyHelper,
  getUsers,
  setUserActiveStatus,
  getAllBookings,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/helpers/pending', getPendingHelpers);
router.patch('/helpers/:id/verify', verifyHelper);
router.get('/users', getUsers);
router.patch('/users/:id/status', setUserActiveStatus);
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);

module.exports = router;
