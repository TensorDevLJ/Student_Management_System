// backend/services/codeforcesService.js
const axios = require('axios');
const { Student, Contest, Submission, ProblemSolved } = require('../models');
const logger = require('../utils/logger');

const CODEFORCES_API_BASE = 'https://codeforces.com/api';
const RATE_LIMIT_DELAY = 200; // 200ms delay between API calls to Codeforces

// Utility function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get user info from Codeforces
async function getUserInfo(handle) {
  try {
    await sleep(RATE_LIMIT_DELAY);
    const response = await axios.get(`${CODEFORCES_API_BASE}/user.info`, {
      params: { handles: handle },
      timeout: 10000
    });

    if (response.data.status === 'OK' && response.data.result.length > 0) {
      return response.data.result[0];
    }
    return null;
  } catch (error) {
    logger.error(`Error fetching user info for ${handle}:`, error.message);
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }
}

// Get user rating changes from Codeforces
async function getUserRatingChanges(handle) {
  try {
    await sleep(RATE_LIMIT_DELAY);
    const response = await axios.get(`${CODEFORCES_API_BASE}/user.rating`, {
      params: { handle },
      timeout: 10000
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }
    return [];
  } catch (error) {
    if (error.response?.status === 400) {
      // User has no rating changes (e.g., new user or hasn't participated in rated contests)
      logger.warn(`No rating changes found for ${handle} (Codeforces API returned 400).`);
      return [];
    }
    logger.error(`Error fetching rating changes for ${handle}:`, error.message);
    throw new Error(`Failed to fetch rating changes: ${error.message}`);
  }
}

// Get user submissions from Codeforces
async function getUserSubmissions(handle, from = 1, count = 100000) { // Default count is very high to get all
  try {
    await sleep(RATE_LIMIT_DELAY);
    const response = await axios.get(`${CODEFORCES_API_BASE}/user.status`, {
      params: { handle, from, count },
      timeout: 15000 // Increased timeout for potentially large responses
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }
    return [];
  } catch (error) {
    logger.error(`Error fetching submissions for ${handle}:`, error.message);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
}

// Sync single student data
async function syncStudentData(studentId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    logger.info(`Syncing data for student: ${student.codeforcesHandle}`);

    // Get user info
    const userInfo = await getUserInfo(student.codeforcesHandle);
    if (!userInfo) {
      // If user not found, disable emails and update lastUpdated for this student
      student.disableEmail = true;
      student.lastUpdated = new Date();
      await student.save();
      logger.warn(`Codeforces user ${student.codeforcesHandle} not found. Emails disabled.`);
      throw new Error(`Codeforces user ${student.codeforcesHandle} not found.`);
    }

    // Update student basic info
    student.currentRating = userInfo.rating || 0;
    student.maxRating = userInfo.maxRating || userInfo.rating || 0;
    student.rank = userInfo.rank || 'Unrated';
    student.avatar = userInfo.avatar || '';
    student.lastUpdated = new Date(); // Update last sync time

    // Get and sync rating changes (contests)
    const ratingChanges = await getUserRatingChanges(student.codeforcesHandle);
    await syncContests(student._id, ratingChanges);

    // Get and sync submissions
    const submissions = await getUserSubmissions(student.codeforcesHandle);
    await syncSubmissions(student._id, submissions);

    // Update last submission time based on newly fetched submissions
    if (submissions.length > 0) {
      const latestSubmission = submissions.reduce((latest, current) =>
        current.creationTimeSeconds > latest.creationTimeSeconds ? current : latest
      );
      student.lastSubmissionTime = new Date(latestSubmission.creationTimeSeconds * 1000);
    } else {
      // If no submissions found, set to a very old date or null to trigger inactivity
      student.lastSubmissionTime = null; // Or new Date(0)
    }

    await student.save();
    logger.info(`Successfully synced data for ${student.codeforcesHandle}`);

  } catch (error) {
    logger.error(`Error syncing student ${studentId} (${student ? student.codeforcesHandle : 'unknown'}):`, error);
    throw error; // Re-throw to be caught by cron job or route handler
  }
}

// Sync contests for a student
async function syncContests(studentId, ratingChanges) {
  try {
    // Get existing contests to avoid duplicates
    const existingContests = await Contest.find({ student: studentId }).select('contestId');
    const existingContestIds = new Set(existingContests.map(c => c.contestId));

    // Filter new contests
    const newContests = ratingChanges
      .filter(change => !existingContestIds.has(change.contestId))
      .map(change => ({
        student: studentId,
        contestId: change.contestId,
        contestName: change.contestName,
        rank: change.rank,
        oldRating: change.oldRating,
        newRating: change.newRating,
        ratingChange: change.newRating - change.oldRating,
        ratingUpdateTimeSeconds: change.ratingUpdateTimeSeconds
      }));

    if (newContests.length > 0) {
      await Contest.insertMany(newContests);
      logger.info(`Added ${newContests.length} new contests for student ${studentId}`);
    }

  } catch (error) {
    logger.error(`Error syncing contests for student ${studentId}:`, error);
    throw error;
  }
}

// Sync submissions for a student
async function syncSubmissions(studentId, submissions) {
  try {
    // Get existing submissions to avoid duplicates
    const existingSubmissions = await Submission.find({ student: studentId }).select('submissionId');
    const existingSubmissionIds = new Set(existingSubmissions.map(s => s.submissionId));

    // Filter new submissions
    const newSubmissions = submissions.filter(sub =>
      !existingSubmissionIds.has(sub.id)
    );

    // Process submissions in batches to avoid memory issues and potential duplicate key errors (if ordered: true)
    const batchSize = 1000;
    for (let i = 0; i < newSubmissions.length; i += batchSize) {
      const batch = newSubmissions.slice(i, i + batchSize);

      const submissionDocs = batch.map(sub => ({
        student: studentId,
        submissionId: sub.id,
        contestId: sub.contestId || 0,
        problem: {
          contestId: sub.problem?.contestId,
          index: sub.problem?.index,
          name: sub.problem?.name,
          type: sub.problem?.type,
          points: sub.problem?.points,
          rating: sub.problem?.rating,
          tags: sub.problem?.tags || []
        },
        author: sub.author?.members?.[0]?.handle || sub.author?.ghost || 'Unknown', // Handle ghost type authors
        programmingLanguage: sub.programmingLanguage,
        verdict: sub.verdict,
        testset: sub.testset || 'TESTS',
        passedTestCount: sub.passedTestCount || 0,
        timeConsumedMillis: sub.timeConsumedMillis || 0,
        memoryConsumedBytes: sub.memoryConsumedBytes || 0,
        creationTimeSeconds: sub.creationTimeSeconds
      }));

      if (submissionDocs.length > 0) {
        // Use { ordered: false } to continue inserting even if some fail due to duplicate keys
        // (though 'unique' index on submissionId should prevent most issues, good for robustness)
        await Submission.insertMany(submissionDocs, { ordered: false });
      }
    }

    // Sync solved problems (only from newly added submissions)
    await syncSolvedProblems(studentId, newSubmissions);

    if (newSubmissions.length > 0) {
      logger.info(`Added ${newSubmissions.length} new submissions for student ${studentId}`);
    }

  } catch (error) {
    logger.error(`Error syncing submissions for student ${studentId}:`, error);
    // If a bulk insert fails due to duplicates, it might throw an error but still insert others.
    // Log the error but don't necessarily re-throw if it's due to duplicates and not critical.
    if (error.code === 11000) { // Duplicate key error
        logger.warn(`Duplicate key error during submission sync for student ${studentId}. Some submissions might already exist.`);
    } else {
        throw error;
    }
  }
}

// Sync solved problems for a student (from a batch of submissions)
async function syncSolvedProblems(studentId, submissions) {
  try {
    // Get existing solved problems for the student
    const existingProblems = await ProblemSolved.find({ student: studentId }).select('problemName');
    const existingProblemNames = new Set(existingProblems.map(p => p.problemName));

    // Find accepted submissions for problems not already marked as solved
    const acceptedSubmissions = submissions.filter(sub =>
      sub.verdict === 'OK' &&
      sub.problem?.name && // Ensure problem name exists
      !existingProblemNames.has(sub.problem.name) // Ensure it's a new problem solved
    );

    // Group by problem name and keep the earliest accepted submission for each unique problem
    const problemMap = new Map();
    acceptedSubmissions.forEach(sub => {
      const problemName = sub.problem.name;
      if (!problemMap.has(problemName) ||
          sub.creationTimeSeconds < problemMap.get(problemName).creationTimeSeconds) {
        problemMap.set(problemName, sub);
      }
    });

    // Create problem solved documents
    const newProblems = Array.from(problemMap.values()).map(sub => ({
      student: studentId,
      problemName: sub.problem.name,
      problemRating: sub.problem.rating || 0,
      tags: sub.problem.tags || [],
      solvedAt: new Date(sub.creationTimeSeconds * 1000),
      language: sub.programmingLanguage,
      verdict: sub.verdict // Should be 'OK' since filtered above
    }));

    if (newProblems.length > 0) {
      await ProblemSolved.insertMany(newProblems);
      logger.info(`Added ${newProblems.length} new solved problems for student ${studentId}`);
    }

  } catch (error) {
    logger.error(`Error syncing solved problems for student ${studentId}:`, error);
    throw error;
  }
}

// Sync all students (called by cron job)
async function syncAllStudents() {
  try {
    const students = await Student.find({ /* add filters here if needed, e.g., active students */ });
    logger.info(`Starting batch sync for ${students.length} students`);

    let successCount = 0;
    let errorCount = 0;
    const errors = []; // To collect detailed errors

    for (const student of students) {
      try {
        await syncStudentData(student._id);
        successCount++;

        // Add delay between students to respect Codeforces API rate limits
        // This is crucial for batch processing
        await sleep(RATE_LIMIT_DELAY * 2);

      } catch (error) {
        logger.error(`Failed to sync student ${student.codeforcesHandle}:`, error.message);
        errorCount++;
        errors.push({ student: student.codeforcesHandle, error: error.message });
        // Continue with next student even if current one fails
        continue;
      }
    }

    logger.info(`Batch sync completed. Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount, errors }; // Return stats for reporting

  } catch (error) {
    logger.error('Error in syncAllStudents master process:', error);
    throw error;
  }
}

// Get contest standings
async function getContestStandings(contestId, from = 1, count = 50) {
  try {
    await sleep(RATE_LIMIT_DELAY);
    const response = await axios.get(`${CODEFORCES_API_BASE}/contest.standings`, {
      params: { contestId, from, count, showUnofficial: true }, // Include unofficial participants
      timeout: 10000
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }
    return null;
  } catch (error) {
    logger.error(`Error fetching contest standings for ${contestId}:`, error.message);
    throw new Error(`Failed to fetch contest standings: ${error.message}`);
  }
}

// Get recent contests
async function getRecentContests() {
  try {
    await sleep(RATE_LIMIT_DELAY);
    const response = await axios.get(`${CODEFORCES_API_BASE}/contest.list`, {
      params: { gym: false }, // Exclude gym contests
      timeout: 10000
    });

    if (response.data.status === 'OK') {
      // Filter for recent and upcoming contests, sort by start time
      const now = Math.floor(Date.now() / 1000);
      return response.data.result
        .filter(contest => contest.phase === 'FINISHED' || contest.phase === 'BEFORE') // Only finished or upcoming
        .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds) // Sort by most recent first
        .slice(0, 20); // Limit to 20 contests
    }
    return [];
  } catch (error) {
    logger.error('Error fetching recent contests:', error.message);
    throw new Error(`Failed to fetch recent contests: ${error.message}`);
  }
}

// Validate Codeforces handle existence
async function validateCodeforcesHandle(handle) {
  try {
    const userInfo = await getUserInfo(handle);
    return userInfo !== null;
  } catch (error) {
    logger.warn(`Validation failed for handle ${handle}:`, error.message);
    return false;
  }
}

module.exports = {
  syncStudentData,
  syncAllStudents,
  getUserInfo,
  getUserRatingChanges,
  getUserSubmissions,
  getContestStandings,
  getRecentContests,
  validateCodeforcesHandle
};