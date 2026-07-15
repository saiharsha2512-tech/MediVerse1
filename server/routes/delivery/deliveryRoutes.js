const express = require('express');
const router = express.Router();
const {
  registerDeliveryPartner,
  loginDeliveryPartner,
  getDeliveryProfile,
  updateDeliveryProfile,
  logoutDeliveryPartner,
} = require('../../controllers/delivery/authController');
const {
  getDashboardData,
  getOrders,
  acceptOrder,
  rejectOrder,
  pickupOrder,
  deliverOrder,
  updateStatus,
} = require('../../controllers/delivery/deliveryDashboardController');
const { deliveryProtect } = require('../../middleware/deliveryAuth');

// Public routes
router.post('/register', registerDeliveryPartner);
router.post('/login', loginDeliveryPartner);

// Protected routes
router.get('/profile', deliveryProtect, getDeliveryProfile);
router.put('/profile', deliveryProtect, updateDeliveryProfile);
router.post('/logout', deliveryProtect, logoutDeliveryPartner);

// Dashboard routes
router.get('/dashboard', deliveryProtect, getDashboardData);
router.get('/orders', deliveryProtect, getOrders);
router.put('/orders/:id/accept', deliveryProtect, acceptOrder);
router.put('/orders/:id/reject', deliveryProtect, rejectOrder);
router.put('/orders/:id/pickup', deliveryProtect, pickupOrder);
router.put('/orders/:id/deliver', deliveryProtect, deliverOrder);
router.put('/status', deliveryProtect, updateStatus);

module.exports = router;
