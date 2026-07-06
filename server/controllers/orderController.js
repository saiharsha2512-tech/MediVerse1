const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders/create
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      deliveryInfo, 
      paymentMethod, 
      subTotal, 
      deliveryCharges, 
      discountAmount, 
      totalAmount 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      userId,
      items,
      deliveryInfo,
      paymentMethod,
      subTotal,
      deliveryCharges,
      discountAmount,
      totalAmount,
      status: 'Success' // Mock successful processing
    });

    const createdOrder = await order.save();
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/:userId
// @access  Public
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};
