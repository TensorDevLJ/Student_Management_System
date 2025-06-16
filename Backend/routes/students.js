// backend/routes/students.js
const express = require('express');
const router = express.Router();
const { Student, Contest, Submission, ProblemSolved } = require('../models'); // Ensure ProblemSolved is imported
const { validateStudent } = require('../utils/validation');
const { syncStudentData } = require('../services/codeforcesService');
const { generateCSV } = require('../utils/csvGenerator');
const { sendWelcomeEmail } = require('../services/emailService'); // Import sendWelcomeEmail
const logger = require('../utils/logger');

// Get all students
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { codeforcesHandle: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const students = await Student.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const total = await Student.countDocuments(query);

        res.json({
            students,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        logger.error('Error fetching students:', error);
        res.status(500).json({ message: 'Failed to fetch students' });
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-__v');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        logger.error('Error fetching student:', error);
        res.status(500).json({ message: 'Failed to fetch student' });
    }
});

// Create new student
router.post('/', async (req, res) => {
    try {
        const { error } = validateStudent(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if email or codeforces handle already exists
        const existingStudent = await Student.findOne({
            $or: [
                { email: req.body.email },
                { codeforcesHandle: req.body.codeforcesHandle.toLowerCase() }
            ]
        });

        if (existingStudent) {
            return res.status(400).json({
                message: 'Student with this email or Codeforces handle already exists'
            });
        }

        const student = new Student({
            ...req.body,
            codeforcesHandle: req.body.codeforcesHandle.toLowerCase()
        });

        await student.save();

        // Sync initial data from Codeforces
        try {
            await syncStudentData(student._id);
        } catch (syncError) {
            logger.warn(`Failed to sync initial data for student ${student.codeforcesHandle}:`, syncError);
        }

        // Send welcome email (optional, if email is not disabled)
        if (!student.disableEmail) {
            try {
                await sendWelcomeEmail(student);
            } catch (emailError) {
                logger.warn(`Failed to send welcome email to ${student.email}:`, emailError);
            }
        }

        res.status(201).json(student);
    } catch (error) {
        logger.error('Error creating student:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email or Codeforces handle already exists' });
        } else {
            res.status(500).json({ message: 'Failed to create student' });
        }
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { error } = validateStudent(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const oldHandle = student.codeforcesHandle;
        const newHandle = req.body.codeforcesHandle.toLowerCase();

        // Check for duplicates if email or handle is being changed
        if (req.body.email !== student.email || newHandle !== oldHandle) {
            const existingStudent = await Student.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    { email: req.body.email },
                    { codeforcesHandle: newHandle }
                ]
            });

            if (existingStudent) {
                return res.status(400).json({
                    message: 'Another student with this email or Codeforces handle already exists'
                });
            }
        }

        // Update student
        Object.assign(student, {
            ...req.body,
            codeforcesHandle: newHandle
        });

        await student.save();

        // If handle changed, sync new data
        if (newHandle !== oldHandle) {
            try {
                await syncStudentData(student._id);
            } catch (syncError) {
                logger.warn(`Failed to sync data after handle change for ${newHandle}:`, syncError);
            }
        }

        res.json(student);
    } catch (error) {
        logger.error('Error updating student:', error);
        res.status(500).json({ message: 'Failed to update student' });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete related data
        await Promise.all([
            Contest.deleteMany({ student: req.params.id }),
            Submission.deleteMany({ student: req.params.id }),
            ProblemSolved.deleteMany({ student: req.params.id })
        ]);

        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        logger.error('Error deleting student:', error);
        res.status(500).json({ message: 'Failed to delete student' });
    }
});

// Get student's contest history
router.get('/:id/contests', async (req, res) => {
    try {
        const { days = 365 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const contests = await Contest.find({
            student: req.params.id,
            ratingUpdateTimeSeconds: { $gte: startDate.getTime() / 1000 }
        }).sort({ ratingUpdateTimeSeconds: -1 });

        res.json(contests);
    } catch (error) {
        logger.error('Error fetching contest history:', error);
        res.status(500).json({ message: 'Failed to fetch contest history' });
    }
});

// Get student's problem solving statistics
router.get('/:id/problems', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const problems = await ProblemSolved.find({
            student: req.params.id,
            solvedAt: { $gte: startDate }
        }).sort({ solvedAt: -1 });

        // Calculate statistics
        const stats = {
            totalProblems: problems.length,
            avgProblemsPerDay: problems.length > 0 ? (problems.length / parseInt(days)).toFixed(2) : 0, // Ensure division by zero is handled
            mostDifficultProblem: null, // Initialize
            avgRating: 0,
            ratingDistribution: {},
            tagDistribution: {},
            dailySubmissions: {}
        };

        let totalProblemRating = 0;
        let maxProblemRating = 0;

        problems.forEach(problem => {
            const rating = problem.problemRating || 0;
            totalProblemRating += rating;
            if (rating > maxProblemRating) {
                maxProblemRating = rating;
                stats.mostDifficultProblem = {
                    name: problem.problemName,
                    rating: problem.problemRating,
                    tags: problem.tags
                };
            }

            // Rating distribution
            const bucket = Math.floor(rating / 100) * 100;
            const bucketKey = `${bucket}-${bucket + 99}`; // e.g., "1200-1299"
            if (bucket >= 1600) { // Group 1600+ into one bucket
                stats.ratingDistribution['1600+'] = (stats.ratingDistribution['1600+'] || 0) + 1;
            } else {
                stats.ratingDistribution[bucketKey] = (stats.ratingDistribution[bucketKey] || 0) + 1;
            }


            // Tag distribution
            problem.tags.forEach(tag => {
                stats.tagDistribution[tag] = (stats.tagDistribution[tag] || 0) + 1;
            });

            // Daily submissions for heatmap
            const date = problem.solvedAt.toISOString().split('T')[0];
            stats.dailySubmissions[date] = (stats.dailySubmissions[date] || 0) + 1;
        });

        stats.avgRating = problems.length > 0 ? (totalProblemRating / problems.length).toFixed(0) : 0;

        // Convert ratingDistribution to array of objects for easier frontend charting
        const ratingDistArray = Object.keys(stats.ratingDistribution).map(key => ({
            range: key,
            count: stats.ratingDistribution[key]
        })).sort((a, b) => {
            // Custom sort for rating ranges
            if (a.range === '1600+') return 1; // Always last
            if (b.range === '1600+') return -1; // Always last
            return parseInt(a.range.split('-')[0]) - parseInt(b.range.split('-')[0]);
        });
        stats.ratingDistribution = ratingDistArray;

        res.json({ problems, stats });
    } catch (error) {
        logger.error('Error fetching problem statistics:', error);
        res.status(500).json({ message: 'Failed to fetch problem statistics' });
    }
});


// Force sync student data
router.post('/:id/sync', async (req, res) => {
    try {
        await syncStudentData(req.params.id);
        const student = await Student.findById(req.params.id); // Fetch updated student object
        res.json({ message: 'Sync completed successfully', student });
    } catch (error) {
        logger.error('Error syncing student data:', error);
        res.status(500).json({ message: 'Failed to sync student data', error: error.message });
    }
});

// Download CSV
router.get('/export/csv', async (req, res) => {
    try {
        const students = await Student.find().select('-__v');
        const csv = await generateCSV(students);

        res.header('Content-Type', 'text/csv');
        res.attachment('students.csv');
        res.send(csv);
    } catch (error) {
        logger.error('Error generating CSV:', error);
        res.status(500).json({ message: 'Failed to generate CSV' });
    }
});

module.exports = router;