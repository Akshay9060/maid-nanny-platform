const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
    servicePlan: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      required: true,
    },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    notes: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.index({ household: 1, status: 1 });
bookingSchema.index({ helper: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
