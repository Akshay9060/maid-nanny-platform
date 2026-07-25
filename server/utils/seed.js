require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Helper = require('../models/Helper');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Helper.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('Creating a sample household...');
  const household = await User.create({
    name: 'Riya Sharma',
    email: 'household@example.com',
    password: 'Household@123',
    role: 'household',
    phone: '9990001111',
    address: { line1: 'Flat 4B, Green Residency', city: 'Patna', state: 'Bihar', pincode: '800001' },
  });

  console.log('Creating sample helpers...');
  const helperSeeds = [
    {
      name: 'Sunita Devi',
      email: 'sunita.maid@example.com',
      serviceType: 'maid',
      city: 'Patna',
      experienceYears: 6,
      skills: ['Cooking', 'Cleaning', 'Laundry'],
      pricing: { hourly: 150, monthly: 8000, yearly: 90000 },
    },
    {
      name: 'Anjali Kumari',
      email: 'anjali.nanny@example.com',
      serviceType: 'nanny',
      city: 'Patna',
      experienceYears: 4,
      skills: ['Infant care', 'First aid', 'Feeding'],
      pricing: { hourly: 200, monthly: 12000, yearly: 130000 },
    },
    {
      name: 'Pooja Singh',
      email: 'pooja.babysitter@example.com',
      serviceType: 'babysitter',
      city: 'Purnia',
      experienceYears: 2,
      skills: ['Homework help', 'Playtime supervision'],
      pricing: { hourly: 120, monthly: null, yearly: null },
    },
  ];

  for (const h of helperSeeds) {
    const user = await User.create({
      name: h.name,
      email: h.email,
      password: 'Helper@123',
      role: 'helper',
      phone: '9990002222',
    });
    await Helper.create({
      user: user._id,
      serviceType: h.serviceType,
      city: h.city,
      experienceYears: h.experienceYears,
      skills: h.skills,
      bio: `${h.name} is an experienced, background-verified ${h.serviceType}.`,
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timeSlot: '9:00 AM - 6:00 PM' },
      pricing: h.pricing,
      verification: { status: 'approved', reviewedBy: admin._id, reviewedAt: new Date() },
      ratingAverage: 4.5,
      ratingCount: 12,
    });
  }

  console.log('\nSeed complete. Test accounts:');
  console.log('  Admin:     admin@example.com / Admin@123');
  console.log('  Household: household@example.com / Household@123');
  console.log('  Helper:    sunita.maid@example.com / Helper@123 (and similarly for anjali/pooja)');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});