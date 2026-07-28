// server/utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Helper = require('../models/Helper');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Get credentials from environment variables (with fallbacks for local dev)
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const HOUSEHOLD_EMAIL = process.env.SEED_HOUSEHOLD_EMAIL || 'household@example.com';
const HOUSEHOLD_PASSWORD = process.env.SEED_HOUSEHOLD_PASSWORD || 'Household@123';
const HELPER_EMAIL = process.env.SEED_HELPER_EMAIL || 'helper@example.com';
const HELPER_PASSWORD = process.env.SEED_HELPER_PASSWORD || 'Helper@123';

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Clearing existing data...');

    // Clear collections (optional - use with caution in production)
    await User.deleteMany({});
    await Helper.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    console.log('Creating admin...');
    const admin = await User.create({
      name: 'Platform Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });

    console.log('Creating household...');
    const household = await User.create({
      name: 'Test Household',
      email: HOUSEHOLD_EMAIL,
      password: HOUSEHOLD_PASSWORD,
      role: 'household',
    });

    console.log('Creating helper user...');
    const helperUser = await User.create({
      name: 'Test Helper',
      email: HELPER_EMAIL,
      password: HELPER_PASSWORD,
      role: 'helper',
    });

    console.log('Creating helper profile...');
    const helperProfile = await Helper.create({
      user: helperUser._id,               // use "user", not "userId"
      city: 'Mumbai',                     // required – choose any city
      serviceType: 'maid',
      skills: ['Cleaning', 'Cooking'],    // optional, keep if your schema allows
      experienceYears: 2,                     // optional, keep if allowed
      hourlyRate: 25,                     // optional, keep if allowed
      isAvailableForBooking: true,                 // optional, keep if allowed
    });

    console.log('Creating booking...');
    await Booking.create({
      householdId: household._id,
      helperId: helperUser._id,
      date: new Date(),
      status: 'pending',
      totalPrice: 100,
    });

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();