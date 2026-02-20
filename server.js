const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const cartRoutes = require('./routes/cart.routes');
const eventRoutes = require('./routes/event.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const contactRoutes = require('./routes/contact.routes');
const adminRoutes = require('./routes/admin.routes');

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true, // Enable cookies to be sent with requests
  optionsSuccessStatus: 200 // Set success status for preflight requests
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File upload directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});