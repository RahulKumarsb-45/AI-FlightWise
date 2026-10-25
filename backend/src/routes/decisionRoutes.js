const express = require('express');
const decisionController = require('../controllers/decisionController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

router.get('/', decisionController.listAll);
router.post('/', decisionController.create);
router.get('/export', decisionController.exportDecisionsMarkdown);
router.get('/:id', decisionController.getById);
router.put('/:id', decisionController.edit);
router.delete('/:id', decisionController.remove);

module.exports = router;
