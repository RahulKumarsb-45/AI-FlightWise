const express = require('express');
const copilotController = require('../controllers/copilotController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

// Evidence and AI generation
router.get('/evidence', copilotController.getEvidence);
router.post('/rice', copilotController.computeRice);
router.post('/generate', copilotController.generate);

// PRD Management
router.get('/prds', copilotController.getAllPrds);
router.post('/prds', copilotController.savePrd);
router.get('/prds/:id', copilotController.getSinglePrd);
router.put('/prds/:id', copilotController.editPrd);
router.delete('/prds/:id', copilotController.removePrd);
router.get('/prds/:id/export', copilotController.exportPrdMarkdown);

module.exports = router;
