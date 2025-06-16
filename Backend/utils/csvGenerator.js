// backend/utils/csvGenerator.js
const { Parser } = require('json2csv');
const logger = require('./logger');

const generateCSV = (students) => {
  // Define the fields for your CSV, matching your Student schema keys
  const fields = [
    'name',
    'email',
    'phoneNumber',
    'codeforcesHandle',
    'currentRating',
    'maxRating',
    'rank',
    'lastUpdated', // This will be a Date object, json2csv handles it well
    'reminderCount',
    'disableEmail'
  ];

  const opts = {
    fields,
    header: true // Include header row
  };

  try {
    const parser = new Parser(opts);
    const csv = parser.parse(students);
    return csv;
  } catch (err) {
    logger.error('Error in CSV generation:', err);
    throw new Error('Failed to generate CSV: ' + err.message);
  }
};

module.exports = {
  generateCSV
};