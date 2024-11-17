const express = require('express');
const { initializeDatabase } = require('../controller/initializeController');

const router = express.Router();

router.get('/', initializeDatabase);

module.exports = router;
