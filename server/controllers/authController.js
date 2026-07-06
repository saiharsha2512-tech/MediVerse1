const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password, role } = req.body;

    // Optional: filter by role if provided, else just find by phone
    const query = { phoneNumber };
    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query);

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, phoneNumber, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this phone number' });
    }

    // Create user
    const user = await User.create({
      name,
      phoneNumber,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          _id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { loginUser, registerUser };
