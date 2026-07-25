const User = require('../models/User');
const Helper = require('../models/Helper');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// GET /api/admin/helpers/pending
const getPendingHelpers = async (req, res) => {
  try {
    const helpers = await Helper.find({ 'verification.status': 'pending' }).populate('user', 'name email phone');
    res.json({ count: helpers.length, helpers });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch pending helpers.', error: err.message });
  }
};

// PATCH /api/admin/helpers/:id/verify
const verifyHelper = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be "approved" or "rejected".' });
    }
    const helper = await Helper.findById(req.params.id);
    if (!helper) return res.status(404).json({ message: 'Helper not found.' });

    helper.verification.status = status;
    helper.verification.reviewedBy = req.user._id;
    helper.verification.reviewedAt = new Date();
    if (status === 'rejected') helper.verification.rejectionReason = rejectionReason || 'Not specified';

    await helper.save();
    res.json({ helper });
  } catch (err) {
    res.status(500).json({ message: 'Could not update verification status.', error: err.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch users.', error: err.message });
  }
};

// PATCH /api/admin/users/:id/status
const setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Could not update user status.', error: err.message });
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter)
      .populate('household', 'name email')
      .populate({ path: 'helper', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch bookings.', error: err.message });
  }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const [households, helpersTotal, helpersVerified, bookingsTotal, bookingsCompleted, bookingsCancelled, reviews] =
      await Promise.all([
        User.countDocuments({ role: 'household' }),
        Helper.countDocuments({}),
        Helper.countDocuments({ 'verification.status': 'approved' }),
        Booking.countDocuments({}),
        Booking.countDocuments({ status: 'completed' }),
        Booking.countDocuments({ status: 'cancelled' }),
        Review.find({}),
      ]);

    const completionRate = bookingsTotal ? Math.round((bookingsCompleted / bookingsTotal) * 100) : 0;
    const avgSatisfaction = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.json({
      registeredHouseholds: households,
      totalHelpers: helpersTotal,
      verifiedHelpers: helpersVerified,
      totalBookings: bookingsTotal,
      completedBookings: bookingsCompleted,
      cancelledBookings: bookingsCancelled,
      bookingCompletionRate: completionRate,
      averageCustomerSatisfaction: avgSatisfaction,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not compute analytics.', error: err.message });
  }
};

module.exports = {
  getPendingHelpers,
  verifyHelper,
  getUsers,
  setUserActiveStatus,
  getAllBookings,
  getAnalytics,
};