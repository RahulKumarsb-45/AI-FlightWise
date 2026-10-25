const express = require('express');
const roadmapController = require('../controllers/roadmapController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

router.get('/', roadmapController.listItems);
router.post('/', roadmapController.createItem);
router.get('/export', roadmapController.exportRoadmapMarkdown);
router.get('/:id', roadmapController.getItem);
router.put('/:id', roadmapController.editItem);
router.delete('/:id', roadmapController.removeItem);

module.exports = router;
