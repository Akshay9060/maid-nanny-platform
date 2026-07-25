const Booking = require('../models/Booking');
const Helper = require('../models/Helper');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { helperId, servicePlan, startDate, endDate, notes } = req.body;
    if (!helperId || !servicePlan || !startDate) {
      return res.status(400).json({ message: 'helperId, servicePlan, and startDate are required.' });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) return res.status(404).json({ message: 'Helper not found.' });
    if (helper.verification.status !== 'approved') {
      return res.status(400).json({ message: 'This helper is not yet verified and cannot be booked.' });
    }
    if (!helper.isAvailableForBooking) {
      return res.status(400).json({ message: 'This helper is not currently accepting bookings.' });
    }

    const price = helper.pricing?.[servicePlan];
    if (price === undefined || price === null) {
      return res.status(400).json({ message: `This helper does not offer a ${servicePlan} plan.` });
    }

    const booking = await Booking.create({
      household: req.user._id,
      helper: helper._id,
      servicePlan,
      price,
      startDate,
      endDate,
      notes,
      statusHistory: [{ status: 'pending', note: 'Booking request created' }],
    });

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Could not create booking.', error: err.message });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ household: req.user._id })
      .populate({ path: 'helper', populate: { path: 'user', select: 'name phone' } })
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch bookings.', error: err.message });
  }
};

// GET /api/bookings/assigned
const getAssignedBookings = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) return res.status(404).json({ message: 'Helper profile not found.' });

    const bookings = await Booking.find({ helper: helper._id })
      .populate('household', 'name phone address')
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch assigned jobs.', error: err.message });
  }
};

const VALID_TRANSITIONS = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
};

// PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id).populate('helper');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const isHousehold = booking.household.toString() === req.user._id.toString();
    const isHelper = booking.helper.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isHousehold && !isHelper && !isAdmin) {
      return res.status(403).json({ message: 'You are not part of this booking.' });
    }

    // Admins can override transition rules
    if (!isAdmin && !VALID_TRANSITIONS[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot move booking from "${booking.status}" to "${status}".`,
      });
    }

    booking.status = status;
    booking.statusHistory.push({ status, note });
    await booking.save();

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Could not update booking status.', error: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAssignedBookings,
  updateBookingStatus,
};