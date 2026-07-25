const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Helper = require('../models/Helper');

// POST /api/reviews  (household reviews a completed booking)
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.household.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review your own bookings.' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed bookings.' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return res.status(409).json({ message: 'This booking has already been reviewed.' });

    const review = await Review.create({
      booking: bookingId,
      household: req.user._id,
      helper: booking.helper,
      rating,
      comment,
    });

    // Recalculate the helper's rating average
    const helper = await Helper.findById(booking.helper);
    const newCount = helper.ratingCount + 1;
    const newAverage = (helper.ratingAverage * helper.ratingCount + rating) / newCount;
    helper.ratingCount = newCount;
    helper.ratingAverage = Math.round(newAverage * 10) / 10;
    await helper.save();

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Could not submit review.', error: err.message });
  }
};

// GET /api/reviews/helper/:helperId
const getHelperReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ helper: req.params.helperId })
      .populate('household', 'name')
      .sort({ createdAt: -1 });
    res.json({ count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch reviews.', error: err.message });
  }
};

module.exports = { createReview, getHelperReviews };
