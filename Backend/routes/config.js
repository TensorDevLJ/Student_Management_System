// backend/routes/config.js
const express = require('express');
const router = express.Router();
const { Config } = require('../models');
const Joi = require('joi'); // Import Joi for schema validation
const logger = require('../utils/logger');
const cron = require('node-cron');
const { syncAllStudents } = require('../services/codeforcesService');
const { checkInactiveStudents, sendSyncReport } = require('../services/emailService'); // sendSyncReport

// Joi schema for validating cron time
const cronTimeSchema = Joi.object({
    cronTime: Joi.string().required().custom((value, helpers) => {
        if (!cron.validate(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'Cron Time Validation').messages({
        'any.required': 'Cron time is required.',
        'any.invalid': 'Invalid cron time format.'
    })
});

// Store a reference to the scheduled job
let scheduledSyncJob = null; // Initialize as null

// Function to schedule/reschedule the daily sync job
const scheduleDailySync = async (initialStartup = true) => {
    let cronTime;
    try {
        const storedConfig = await Config.findOne({ key: 'dailySyncCronTime' });
        const defaultCronTime = '0 2 * * *'; // Default to 2 AM daily (UTC or server's local time if no timezone specified)
        cronTime = storedConfig ? storedConfig.value : defaultCronTime;

        if (!cron.validate(cronTime)) {
            logger.warn(`Invalid cron time found in DB: "${cronTime}". Falling back to default: "${defaultCronTime}"`);
            cronTime = defaultCronTime;
        }

    } catch (err) {
        logger.error('Failed to retrieve daily sync schedule from DB:', err);
        logger.warn('Falling back to default cron time: "0 2 * * *"');
        cronTime = '0 2 * * *'; // Fallback to default if DB fails
    }

    // If a job is already scheduled, destroy it first
    if (scheduledSyncJob) {
        scheduledSyncJob.stop();
        logger.info('Previous daily sync job stopped.');
    }

    // Schedule the new job
    scheduledSyncJob = cron.schedule(cronTime, async () => {
        logger.info(`Starting scheduled daily sync job at ${cronTime}`);
        let syncStats = { successCount: 0, errorCount: 0 };
        let emailStats = { emailsSent: 0, emailsFailed: 0, totalInactive: 0 };
        try {
            syncStats = await syncAllStudents();
            emailStats = await checkInactiveStudents();
            logger.info('Scheduled daily sync job completed successfully');
        } catch (error) {
            logger.error('Scheduled daily sync job failed:', error);
        } finally {
            // Send daily sync report to admin
            try {
                await sendSyncReport({ ...syncStats, ...emailStats });
            } catch (reportError) {
                logger.error('Failed to send daily sync report:', reportError);
            }
        }
    }, {
        scheduled: true,
        timezone: process.env.TIMEZONE || 'Asia/Kolkata' // Use timezone from .env or default
    });
    logger.info(`Daily sync job scheduled for: "${cronTime}" (Timezone: ${process.env.TIMEZONE || 'Asia/Kolkata'})`);

    if (initialStartup) {
        // Run immediately on startup for faster initial data populate (optional, or just wait for first cron)
        // Or you might want a separate "force sync" endpoint for this
        // logger.info('Running initial sync on startup...');
        // await syncAllStudents();
        // await checkInactiveStudents();
    }
    return cronTime; // Return the active cron time
};

// Export the scheduling function to be called from server.js on startup
module.exports.scheduleDailySync = scheduleDailySync;


// Get current configuration (e.g., cron job schedule)
router.get('/', async (req, res) => {
    try {
        const configs = await Config.find({});
        res.json(configs);
    } catch (error) {
        logger.error('Error fetching configurations:', error.message);
        res.status(500).json({ message: 'Failed to fetch configurations' });
    }
});

// Update configuration (e.g., change cron job schedule)
router.post('/sync', async (req, res) => {
    try {
        const { error } = cronTimeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { cronTime } = req.body;

        let config = await Config.findOne({ key: 'dailySyncCronTime' });
        if (config) {
            config.value = cronTime;
            config.description = 'Cron schedule for daily data synchronization and email reminders.';
        } else {
            config = new Config({
                key: 'dailySyncCronTime',
                value: cronTime,
                description: 'Cron schedule for daily data synchronization and email reminders.'
            });
        }
        await config.save();

        // Reschedule the cron job immediately
        await scheduleDailySync(false); // Not initial startup

        res.json({ message: 'Daily sync schedule updated successfully', newCronTime: cronTime });
    } catch (error) {
        logger.error('Error updating sync configuration:', error.message);
        res.status(500).json({ message: 'Failed to update sync configuration', error: error.message });
    }
});

module.exports = router;