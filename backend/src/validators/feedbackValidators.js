const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR'));
  }
  next();
}

const submitFeedbackValidator = [
  body('isHelpful')
    .isBoolean()
    .withMessage('isHelpful is required and must be a boolean'),
  body('recommendationRank')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('recommendationRank must be an integer between 1 and 20'),
  body('reason')
    .optional()
    .isString()
    .isIn([
      'price_too_high',
      'duration_too_long',
      'layover_inconvenient',
      'wrong_airport',
      'mismatch_preferences',
      'other',
    ])
    .withMessage('Invalid feedback reason provided'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  body('searchContext')
    .optional()
    .isObject()
    .withMessage('searchContext must be an object'),
  handleValidation,
];

module.exports = {
  submitFeedbackValidator,
  handleValidation,
};
