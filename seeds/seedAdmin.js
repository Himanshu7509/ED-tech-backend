const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');

// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create default admin user
const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL_DEFAULT,
      role: 'admin' 
    });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation.');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: process.env.ADMIN_FULLNAME_DEFAULT,
      email: process.env.ADMIN_EMAIL_DEFAULT,
      phone: process.env.ADMIN_PHONE_DEFAULT,
      password: process.env.ADMIN_PASSWORD_DEFAULT,
      role: 'admin',
      isVerified: true
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD_DEFAULT}`);
    console.log('Please change the default password after first login for security.');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
createAdminUser();