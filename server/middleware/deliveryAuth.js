const jwt = require('jsonwebtoken');
const DeliveryPartner = require('../models/DeliveryPartner');

const deliveryProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const secret = process.env.DELIVERY_JWT_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);

      // Ensure it's a delivery partner token
      if (decoded.role !== 'delivery') {
        return res.status(401).json({ success: false, message: 'Not authorized as delivery partner' });
      }

      req.deliveryPartner = await DeliveryPartner.findById(decoded.id).select('-password');

      if (!req.deliveryPartner) {
        return res.status(401).json({ success: false, message: 'Not authorized, delivery partner not found' });
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

module.exports = { deliveryProtect };
