const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/stats/:shortId', statsController.getStats);
router.get('/health', statsController.healthCheck);

module.exports = router;