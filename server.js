// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Validate MONGO_URI
if (!MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI is not defined in .env file');
  console.error('Please ensure .env file exists and contains: MONGO_URI=your_connection_string');
  process.exit(1);
}

// Debug: Show sanitized URI (hide password)
const sanitizedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('🔗 Connecting to MongoDB...');
console.log('📍 URI:', sanitizedUri);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.reason) {
      console.error('Error Reason:', error.reason);
    }
    console.error('Full Error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
