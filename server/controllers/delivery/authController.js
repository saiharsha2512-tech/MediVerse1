const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const DeliveryPartner = require('../../models/DeliveryPartner');

// Generate JWT for delivery partner
const generateToken = (id) => {
  const secret = process.env.DELIVERY_JWT_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id, role: 'delivery' }, secret, { expiresIn: '30d' });
};

// Helper: sanitize delivery partner data (no password)
const sanitizePartner = (partner) => ({
  _id: partner._id,
  fullName: partner.fullName,
  email: partner.email,
  phone: partner.phone,
  employeeId: partner.employeeId,
  vehicleType: partner.vehicleType,
  vehicleNumber: partner.vehicleNumber,
  drivingLicense: partner.drivingLicense,
  city: partner.city,
  state: partner.state,
  profileImage: partner.profileImage,
  availability: partner.availability,
  status: partner.status,
  createdAt: partner.createdAt,
});

// @desc    Register new delivery partner
// @route   POST /api/delivery/register
// @access  Public
const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      fullName, email, phone, password,
      vehicleType, vehicleNumber, drivingLicense,
      city, state,
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Check for existing partner
    const exists = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Delivery partner already exists with this email or phone' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-generate employee ID
    const count = await DeliveryPartner.countDocuments();
    const employeeId = `DP${String(count + 1).padStart(4, '0')}`;

    const partner = await DeliveryPartner.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      employeeId,
      vehicleType: vehicleType || 'Bike',
      vehicleNumber: vehicleNumber || '',
      drivingLicense: drivingLicense || '',
      city: city || '',
      state: state || '',
    });

    if (partner) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        deliveryPartner: sanitizePartner(partner),
        token: generateToken(partner._id),
      });
    }

    res.status(400).json({ success: false, message: 'Invalid delivery partner data' });
  } catch (error) {
    console.error('Delivery Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login delivery partner
// @route   POST /api/delivery/login
// @access  Public
const loginDeliveryPartner = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone and password' });
    }

    const partner = await DeliveryPartner.findOne({ phone }).select('+password');

    if (!partner) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    // Update status to Available on login
    partner.status = 'Available';
    partner.availability = true;
    await partner.save();

    return res.json({
      success: true,
      message: 'Login successful',
      deliveryPartner: sanitizePartner(partner),
      token: generateToken(partner._id),
    });
  } catch (error) {
    console.error('Delivery Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get delivery partner profile
// @route   GET /api/delivery/profile
// @access  Private
const getDeliveryProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.deliveryPartner._id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found' });
    }
    return res.json({ success: true, data: sanitizePartner(partner) });
  } catch (error) {
    console.error('Get Delivery Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update delivery partner profile
// @route   PUT /api/delivery/profile
// @access  Private
const updateDeliveryProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'email', 'vehicleType', 'vehicleNumber',
      'drivingLicense', 'city', 'state', 'profileImage',
      'availability', 'status',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle password update separately
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const partner = await DeliveryPartner.findByIdAndUpdate(
      req.deliveryPartner._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizePartner(partner),
    });
  } catch (error) {
    console.error('Update Delivery Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Logout delivery partner
// @route   POST /api/delivery/logout
// @access  Private
const logoutDeliveryPartner = async (req, res) => {
  try {
    // Update status to Offline on logout
    await DeliveryPartner.findByIdAndUpdate(req.deliveryPartner._id, {
      status: 'Offline',
      availability: false,
    });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Delivery Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  registerDeliveryPartner,
  loginDeliveryPartner,
  getDeliveryProfile,
  updateDeliveryProfile,
  logoutDeliveryPartner,
};
