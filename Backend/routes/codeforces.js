// backend/routes/codeforces.js
const express = require('express');
const router = express.Router();
const { getRecentContests, getContestStandings, validateCodeforcesHandle } = require('../services/codeforcesService');
const logger = require('../utils/logger');

// Get recent Codeforces contests
router.get('/recent-contests', async (req, res) => {
    try {
        const contests = await getRecentContests();
        res.json(contests);
    } catch (error) {
        logger.error('Error fetching recent contests:', error.message);
        res.status(500).json({ message: 'Failed to fetch recent contests' });
    }
});

// Get contest standings for a specific contest (optional, if you want a separate standings view)
router.get('/standings/:contestId', async (req, res) => {
    try {
        const { from, count } = req.query; // Pagination for standings
        const standings = await getContestStandings(req.params.contestId, from, count);
        if (!standings) {
            return res.status(404).json({ message: 'Contest standings not found or invalid Contest ID' });
        }
        res.json(standings);
    } catch (error) {
        logger.error(`Error fetching standings for contest ${req.params.contestId}:`, error.message);
        res.status(500).json({ message: 'Failed to fetch contest standings' });
    }
});

// Endpoint to validate a Codeforces handle existence
router.get('/validate-handle/:handle', async (req, res) => {
    try {
        const isValid = await validateCodeforcesHandle(req.params.handle);
        res.json({ isValid });
    } catch (error) {
        logger.error(`Error validating handle ${req.params.handle}:`, error.message);
        res.status(500).json({ message: 'Failed to validate handle' });
    }
});

module.exports = router;