const User = require('../models/User');
const Helper = require('../models/Helper');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  address: user.address,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address, serviceType, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const allowedRole = ['household', 'helper'].includes(role) ? role : 'household';

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: allowedRole,
      address,
    });

    // If registering as a helper, create a starter helper profile
    if (allowedRole === 'helper') {
      if (!serviceType || !city) {
        // Roll back the user because required helper fields are missing
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: 'serviceType (maid/babysitter/nanny) and city are required to register as a helper.',
        });
      }
      try {
        await Helper.create({
          user: user._id,
          serviceType,
          city,
        });
      } catch (helperErr) {
        // Rollback user if helper creation fails (e.g., duplicate, validation)
        await User.findByIdAndDelete(user._id);
        throw helperErr; // rethrow to outer catch
      }
    }

    const token = generateToken(user._id);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been disabled. Contact support.' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

module.exports = { register, login, getMe };