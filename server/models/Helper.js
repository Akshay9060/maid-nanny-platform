const mongoose = require('mongoose');

const servicePlanPriceSchema = new mongoose.Schema(
  {
    hourly: { type: Number, default: null },
    monthly: { type: Number, default: null },
    yearly: { type: Number, default: null },
  },
  { _id: false }
);

const helperSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    serviceType: {
      type: String,
      enum: ['maid', 'babysitter', 'nanny'],
      required: true,
    },
    bio: { type: String, trim: true, maxlength: 1000 },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    city: { type: String, required: true, trim: true },
    availability: {
      days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
      timeSlot: { type: String, trim: true }, // e.g. "9:00 AM - 5:00 PM"
    },
    pricing: { type: servicePlanPriceSchema, default: () => ({}) },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      documents: [
        {
          docType: { type: String, trim: true },
          fileUrl: { type: String, trim: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: Date,
      rejectionReason: String,
    },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }, // view-only, Phase 1
    isAvailableForBooking: { type: Boolean, default: true },
  },
  { timestamps: true }
);

helperSchema.index({ serviceType: 1, city: 1 });

module.exports = mongoose.model('Helper', helperSchema);
