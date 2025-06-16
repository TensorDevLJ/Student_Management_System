// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const studentRoutes = require('./routes/students');
const codeforcesRoutes = require('./routes/codeforces');
const configRoutes = require('./routes/config'); // Ensure this is correctly imported
const { syncAllStudents } = require('./services/codeforcesService');
const { checkInactiveStudents, sendSyncReport } = require('./services/emailService'); // Added sendSyncReport
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_progress', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
});

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/config', configRoutes); // Config routes for managing schedules etc.

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize and schedule daily sync job
// This function is now defined in config.js to manage its lifecycle
// but we call it here to ensure it's scheduled on server start.
const { scheduleDailySync } = require('./routes/config'); // Import the scheduler from config route
(async () => {
    try {
        await scheduleDailySync(); // This will fetch schedule from DB or use default
    } catch (error) {
        logger.error('Failed to initialize daily sync schedule on startup:', error);
    }
})();

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;