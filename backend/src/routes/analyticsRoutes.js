const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

router.post('/events', analyticsController.recordEvent);
router.post('/events/batch', analyticsController.recordBatch);
router.post('/batch', analyticsController.recordBatch);
router.get('/dashboard', analyticsController.getDashboard);
router.get('/export', analyticsController.exportReport);

module.exports = router;
