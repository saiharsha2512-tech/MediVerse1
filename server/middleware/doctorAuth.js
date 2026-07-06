const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const doctorProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token using the same secret or a specific DOCTOR_JWT_SECRET
      const secret = process.env.DOCTOR_JWT_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      
      // Ensure it's a doctor token
      if (decoded.role !== 'doctor') {
        return res.status(401).json({ success: false, message: 'Not authorized as doctor' });
      }

      // Fetch doctor and attach to req
      req.doctor = await Doctor.findById(decoded.id).select('-password');
      
      if (!req.doctor) {
        return res.status(401).json({ success: false, message: 'Not authorized, doctor not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { doctorProtect };
