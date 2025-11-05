const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserPreferences = [
  body('preferences.categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('preferences.categories.*')
    .optional()
    .isIn(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'])
    .withMessage('Invalid category'),
  body('preferences.sources')
    .optional()
    .isArray()
    .withMessage('Sources must be an array'),
  body('preferences.keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Language must be a 2-character code'),
  body('preferences.country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-character code'),
  handleValidationErrors
];

// News validation rules
const validateNewsQuery = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isIn(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'])
    .withMessage('Invalid category'),
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-character code'),
  query('language')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Language must be a 2-character code'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page must be between 1 and 100'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
  handleValidationErrors
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserPreferences,
  validateNewsQuery,
  validateObjectId
};
