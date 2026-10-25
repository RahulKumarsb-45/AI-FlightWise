const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { submitFeedbackValidator } = require('../validators/feedbackValidators');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', optionalAuth, submitFeedbackValidator, feedbackController.submitFeedback);
router.get('/summary', feedbackController.getFeedbackSummary);

module.exports = router;
