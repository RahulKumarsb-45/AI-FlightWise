const express = require('express');
const authRoutes = require('./authRoutes');
const airportRoutes = require('./airportRoutes');
const countryRoutes = require('./countryRoutes');
const searchRoutes = require('./searchRoutes');
const tripRoutes = require('./tripRoutes');
const paymentRoutes = require('./paymentRoutes');
const aiRoutes = require('./aiRoutes');
const weatherRoutes = require('./weatherRoutes');
const placesRoutes = require('./placesRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const copilotRoutes = require('./copilotRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const decisionRoutes = require('./decisionRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'OK', timestamp: new Date().toISOString() });
});

// Core FlightWise Travel Routes
router.use('/auth', authRoutes);
router.use('/airports', airportRoutes);
router.use('/countries', countryRoutes);
router.use('/search', searchRoutes);
router.use('/trips', tripRoutes);
router.use('/payments', paymentRoutes);
router.use('/ai', aiRoutes);
router.use('/weather', weatherRoutes);
router.use('/places', placesRoutes);

// Product Management Workspace & Intelligence Routes (Analytics, Feedback, Copilot, Roadmap, Decisions)
router.use('/feedback', feedbackRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/copilot', copilotRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/decisions', decisionRoutes);

module.exports = router;
