// backend/utils/validation.js
const Joi = require('joi');

// Schema for validating student data
const studentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-()]+$/).allow('').optional().trim(), // Allow empty string
  codeforcesHandle: Joi.string().min(1).max(50).required().trim().lowercase(),
  disableEmail: Joi.boolean().optional()
});

// Function to validate student data against the schema
const validateStudent = (data) => {
  return studentSchema.validate(data);
};

// You can add more validation schemas here if needed, e.g., for config updates
const configUpdateSchema = Joi.object({
    cronTime: Joi.string().required().custom((value, helpers) => {
        // Basic check, node-cron's validate is more robust
        const parts = value.split(' ').filter(p => p !== '');
        if (parts.length < 5 || parts.length > 6) { // min 5 parts for cron
            return helpers.error('any.invalid');
        }
        return value;
    }, 'Cron Time Format').messages({
        'any.required': 'Cron time is required.',
        'any.invalid': 'Invalid cron time format.'
    })
});

const validateConfigUpdate = (data) => {
    return configUpdateSchema.validate(data);
};

module.exports = {
  validateStudent,
  validateConfigUpdate
};