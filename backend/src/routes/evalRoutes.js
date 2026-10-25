const express = require('express');
const rateLimit = require('express-rate-limit');
const evalController = require('../controllers/evalController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Rate limiter for expensive evaluation benchmark runs
const evalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 runs per minute per IP
  message: {
    status: 'error',
    message: 'Too many evaluation requests. Please wait a minute before triggering another benchmark.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

router.use(optionalAuth);

router.get('/latest', evalController.getLatest);
router.get('/history', evalController.getHistory);
router.get('/status', evalController.getStatus);
router.get('/export/:id', evalController.exportMarkdown);
router.get('/:id', evalController.getById);
router.post('/run', evalLimiter, evalController.triggerRun);

module.exports = router;
