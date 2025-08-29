const express = require('express');
const router = express.Router();
const urlRoutes = require('../Routes/UrlRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/', urlRoutes);
router.use('/', statsRoutes);

module.exports = router;