const express = require('express');
const evalController = require('../controllers/evalController');

const router = express.Router();

router.get('/latest', evalController.getLatest);
router.post('/run', evalController.triggerRun);

module.exports = router;
