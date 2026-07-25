const Helper = require('../models/Helper');
const User = require('../models/User');

// GET /api/helpers
const listHelpers = async (req, res) => {
  try {
    const { serviceType, city, minExperience, plan, day, search, verifiedOnly } = req.query;
    const filter = {};

    if (serviceType) filter.serviceType = serviceType;
    if (city) filter.city = new RegExp(`^${city}$`, 'i');
    if (minExperience) filter.experienceYears = { $gte: Number(minExperience) };
    if (day) filter['availability.days'] = day;
    if (plan) filter[`pricing.${plan}`] = { $ne: null };
    if (verifiedOnly === 'true') filter['verification.status'] = 'approved';

    let query = Helper.find(filter).populate('user', 'name phone').sort({ ratingAverage: -1, createdAt: -1 });

    if (search) {
      const regex = new RegExp(search, 'i');
      query = Helper.find({
        ...filter,
        $or: [{ skills: regex }, { bio: regex }],
      }).populate('user', 'name phone');
    }

    const helpers = await query;
    res.json({ count: helpers.length, helpers });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch helpers.', error: err.message });
  }
};

// GET /api/helpers/:id
const getHelper = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id).populate('user', 'name phone email');
    if (!helper) return res.status(404).json({ message: 'Helper profile not found.' });
    res.json({ helper });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch helper.', error: err.message });
  }
};

// GET /api/helpers/me/profile
const getMyHelperProfile = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id }).populate('user', 'name phone email');
    if (!helper) return res.status(404).json({ message: 'Helper profile not found.' });
    res.json({ helper });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch profile.', error: err.message });
  }
};

// PUT /api/helpers/me/profile
const updateMyHelperProfile = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) return res.status(404).json({ message: 'Helper profile not found.' });

    const editableFields = ['bio', 'skills', 'experienceYears', 'city', 'availability', 'pricing', 'isAvailableForBooking'];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) helper[field] = req.body[field];
    });

    await helper.save();
    res.json({ helper });
  } catch (err) {
    res.status(500).json({ message: 'Could not update profile.', error: err.message });
  }
};

// POST /api/helpers/me/documents
const addVerificationDocument = async (req, res) => {
  try {
    const { docType, fileUrl } = req.body;
    if (!docType || !fileUrl) {
      return res.status(400).json({ message: 'docType and fileUrl are required.' });
    }
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) return res.status(404).json({ message: 'Helper profile not found.' });

    helper.verification.documents.push({ docType, fileUrl });
    // Only reset to pending if not already approved
    if (helper.verification.status !== 'approved') {
      helper.verification.status = 'pending';
    }
    await helper.save();
    res.json({ helper });
  } catch (err) {
    res.status(500).json({ message: 'Could not upload document.', error: err.message });
  }
};

module.exports = {
  listHelpers,
  getHelper,
  getMyHelperProfile,
  updateMyHelperProfile,
  addVerificationDocument,
};