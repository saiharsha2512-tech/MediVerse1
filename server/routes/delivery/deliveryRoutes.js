const express = require('express');
const router = express.Router();
const {
  registerDeliveryPartner,
  loginDeliveryPartner,
  getDeliveryProfile,
  updateDeliveryProfile,
  logoutDeliveryPartner,
} = require('../../controllers/delivery/authController');
const { deliveryProtect } = require('../../middleware/deliveryAuth');

// Public routes
router.post('/register', registerDeliveryPartner);
router.post('/login', loginDeliveryPartner);

// Protected routes
router.get('/profile', deliveryProtect, getDeliveryProfile);
router.put('/profile', deliveryProtect, updateDeliveryProfile);
router.post('/logout', deliveryProtect, logoutDeliveryPartner);

module.exports = router;
