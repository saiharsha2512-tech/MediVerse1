const express = require('express');
const router = express.Router();
const { registerDoctor, loginDoctor, logoutDoctor } = require('../../controllers/doctor/authController');
const { doctorProtect } = require('../../middleware/doctorAuth');

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.post('/logout', doctorProtect, logoutDoctor);

module.exports = router;
