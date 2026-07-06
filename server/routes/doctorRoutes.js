const express = require('express');
const { getDoctors, getDoctorById, searchDoctors } = require('../controllers/doctorController');

const router = express.Router();

// Note: Order matters here, /search needs to be above /:id
router.get('/search', searchDoctors);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

module.exports = router;
