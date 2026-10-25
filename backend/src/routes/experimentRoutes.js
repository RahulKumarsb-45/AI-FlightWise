const express = require('express');
const experimentController = require('../controllers/experimentController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

router.get('/', experimentController.listAll);
router.post('/', experimentController.createExperiment);
router.get('/:id', experimentController.getResults);
router.patch('/:id/status', experimentController.updateStatus);
router.post('/assign', experimentController.assign);
router.post('/exposure', experimentController.logExposure);

module.exports = router;
