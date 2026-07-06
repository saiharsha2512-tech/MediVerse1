const express = require('express');
const { getHealthRecords } = require('../controllers/healthController');

const router = express.Router();

router.get('/:userId', getHealthRecords);

module.exports = router;
