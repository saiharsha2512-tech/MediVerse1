const Order = require('../../models/Order');
const DeliveryPartner = require('../../models/DeliveryPartner');

// GET /api/delivery/dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const partnerId = req.deliveryPartner._id;
    const partner = await DeliveryPartner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    // Fetch all relevant orders
    const allOrders = await Order.find({
      $or: [
        { deliveryPartnerId: { $exists: false } },
        { deliveryPartnerId: null },
        { deliveryPartnerId: partnerId }
      ]
    }).sort({ createdAt: -1 });

    const availableOrders = allOrders.filter(o => (!o.deliveryPartnerId && o.status === 'Success' && o.deliveryStatus === 'Pending'));
    const activeOrders = allOrders.filter(o => o.deliveryPartnerId?.toString() === partnerId.toString() && ['Accepted', 'Picked Up'].includes(o.deliveryStatus));
    const completedOrders = allOrders.filter(o => o.deliveryPartnerId?.toString() === partnerId.toString() && o.deliveryStatus === 'Delivered');

    res.status(200).json({
      success: true,
      partner: {
        id: partner._id,
        name: partner.fullName,
        profileImage: partner.profileImage,
        phone: partner.phone,
        employeeId: partner.employeeId,
        rating: partner.rating,
        status: partner.status,
        vehicleType: partner.vehicleType,
        totalDeliveries: partner.totalDeliveries,
        memberSince: partner.createdAt,
      },
      todayStats: {
        deliveries: partner.todayDeliveries,
        earnings: partner.todayEarnings,
        distance: partner.todayDistance,
        rating: partner.rating,
      },
      weeklySummary: {
        deliveries: partner.weeklyDeliveries,
        earnings: partner.weeklyEarnings,
        distance: partner.weeklyDistance,
        rating: partner.rating,
      },
      availableOrders,
      activeOrders,
      completedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /api/delivery/orders
exports.getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status === 'available') {
      query.deliveryPartnerId = { $exists: false };
      query.status = 'Success';
      query.deliveryStatus = 'Pending';
    } else if (status === 'active') {
      query.deliveryPartnerId = req.deliveryPartner._id;
      query.deliveryStatus = { $in: ['Accepted', 'Picked Up'] };
    } else if (status === 'completed') {
      query.deliveryPartnerId = req.deliveryPartner._id;
      query.deliveryStatus = 'Delivered';
    } else {
      // All relevant orders
      query.$or = [
        { deliveryPartnerId: { $exists: false }, status: 'Success', deliveryStatus: 'Pending' },
        { deliveryPartnerId: req.deliveryPartner._id }
      ];
    }

    if (search) {
      // Basic search based on order ID or patient name
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        ...(query.$or || []),
        { _id: isObjectId(search) ? search : null },
        { 'deliveryInfo.fullName': searchRegex },
        { 'deliveryInfo.city': searchRegex },
        { 'deliveryInfo.address': searchRegex }
      ].filter(Boolean);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

function isObjectId(id) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return true;
    }
    return false;
}

// PUT /api/delivery/orders/:id/accept
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.deliveryPartnerId) return res.status(400).json({ success: false, message: 'Order already accepted by someone else' });

    order.deliveryPartnerId = req.deliveryPartner._id;
    order.deliveryStatus = 'Accepted';
    order.acceptedAt = new Date();
    // Generate some mock earning and distance if they don't exist
    if (!order.distance) order.distance = Number((Math.random() * 10 + 1).toFixed(1));
    if (!order.earning) order.earning = Math.floor(order.distance * 15 + 20); // mock calculation
    if (!order.estimatedTime) order.estimatedTime = Math.floor(order.distance * 5 + 10) + ' mins';
    
    await order.save();
    res.status(200).json({ success: true, message: 'Order accepted', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/delivery/orders/:id/reject
exports.rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryPartnerId?.toString() === req.deliveryPartner._id.toString()) {
      order.deliveryPartnerId = undefined;
      order.deliveryStatus = 'Pending';
      order.acceptedAt = undefined;
      await order.save();
    }
    res.status(200).json({ success: true, message: 'Order rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/delivery/orders/:id/pickup
exports.pickupOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.deliveryPartnerId?.toString() !== req.deliveryPartner._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.deliveryStatus = 'Picked Up';
    order.status = 'Shipped';
    await order.save();
    res.status(200).json({ success: true, message: 'Order picked up', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/delivery/orders/:id/deliver
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.deliveryPartnerId?.toString() !== req.deliveryPartner._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.deliveryStatus = 'Delivered';
    order.status = 'Delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Update partner stats
    const partner = await DeliveryPartner.findById(req.deliveryPartner._id);
    partner.totalDeliveries += 1;
    partner.todayDeliveries += 1;
    partner.weeklyDeliveries += 1;
    
    partner.totalEarnings += order.earning;
    partner.todayEarnings += order.earning;
    partner.weeklyEarnings += order.earning;

    partner.todayDistance += order.distance;
    partner.weeklyDistance += order.distance;

    await partner.save();

    res.status(200).json({ success: true, message: 'Order delivered', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/delivery/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Online', 'Offline', 'Busy'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const partner = await DeliveryPartner.findById(req.deliveryPartner._id);
    partner.status = status;
    if (status === 'Online') partner.availability = true;
    if (status === 'Offline') partner.availability = false;
    await partner.save();

    res.status(200).json({ success: true, message: 'Status updated', status: partner.status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
