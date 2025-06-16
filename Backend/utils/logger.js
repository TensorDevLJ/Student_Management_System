// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info' if not specified in .env
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Include stack trace for errors
    winston.format.json() // Log in JSON format for easier parsing by log management tools
  ),
  defaultMeta: { service: 'student-progress-api' }, // Add a default meta field
  transports: [
    // Console transport for development
    // File transports for production logs
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
  exceptionHandlers: [ // Catch uncaught exceptions
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [ // Catch unhandled promise rejections
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// If not in production, also log to the console with colorization
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(), // Add colors to console output
      winston.format.simple() // Simple format for console
    )
  }));
}

module.exports = logger;