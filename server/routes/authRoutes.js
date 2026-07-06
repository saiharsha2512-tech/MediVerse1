const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

module.exports = router;
