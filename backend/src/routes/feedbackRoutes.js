const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { submitFeedbackValidator } = require('../validators/feedbackValidators');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

router.use(optionalAuth);

// Customer feedback intelligence workspace endpoints
router.get('/themes', feedbackController.getCustomerFeedbackThemes);
router.get('/customer', feedbackController.getCustomerFeedbackList);
router.post('/customer', feedbackController.createCustomerFeedback);
router.patch('/customer/:id/status', feedbackController.updateCustomerFeedbackStatus);

// Legacy recommendation feedback endpoints
router.post('/', submitFeedbackValidator, feedbackController.submitFeedback);
router.get('/summary', feedbackController.getFeedbackSummary);

module.exports = router;
