const User = require('../models/User');
const MedicalHistory = require('../models/MedicalHistory');
const MedicalReport = require('../models/MedicalReport');
const Appointment = require('../models/Appointment');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Conversation = require('../models/Conversation');
const ChatSession = require('../models/ChatSession');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// @desc    Get user profile and statistics
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Dynamic stats
    const consultationsCount = await MedicalHistory.countDocuments({ userId: req.user._id });
    const appointmentsCount = await Appointment.countDocuments({ patient: req.user._id }); // Assuming 'patient' is the ref in Appointment
    const reportsCount = await MedicalReport.countDocuments({ userId: req.user._id });
    const ordersCount = await Order.countDocuments({ user: req.user._id }); // Assuming 'user' is the ref in Order
    
    // Recent Activity
    const latestAppointment = await Appointment.findOne({ patient: req.user._id }).sort({ createdAt: -1 });
    const latestOrder = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const latestReport = await MedicalReport.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      stats: {
        consultations: consultationsCount,
        appointments: appointmentsCount,
        reports: reportsCount,
        orders: ordersCount
      },
      recentActivity: {
        appointment: latestAppointment,
        order: latestOrder,
        report: latestReport
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('--- updateProfile API called ---');
    console.log('User ID:', req.user._id);
    console.log('Request Payload:', req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.role;
    delete updates.password;

    // Assign all fields from request body to the user object
    Object.assign(user, updates);

    // Maintain 'name' for backward compatibility
    if (updates.firstName || updates.lastName) {
       user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else if (updates.name) {
       user.name = updates.name;
    }

    // Auto calc BMI if height and weight exist
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100;
      user.bmi = parseFloat((user.weight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    const updatedUser = await user.save();
    console.log('MongoDB Update Result:', updatedUser);
    console.log('--- updateProfile API end ---');
    
    res.json({
        success: true,
        user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update profile photo
// @route   PUT /api/profile/photo
// @access  Private
const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Remove old image if exists and not default
    if (user.profileImage) {
      const oldPath = path.join(__dirname, '..', 'public', user.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({ success: true, profileImage: user.profileImage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/profile/photo
// @access  Private
const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.profileImage) {
      const oldPath = path.join(__dirname, '..', 'public', user.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      user.profileImage = '';
      await user.save();
    }
    res.json({ success: true, message: 'Profile photo removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Change Password
// @route   PUT /api/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save(); // pre-save hook handles hashing
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect current password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete Account (Cascading)
// @route   DELETE /api/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Delete associated files (profile image, reports)
    if (user.profileImage) {
      const imgPath = path.join(__dirname, '..', 'public', user.profileImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    
    const reports = await MedicalReport.find({ userId: req.user._id });
    reports.forEach(report => {
      if (report.fileUrl) {
        const reportPath = path.join(__dirname, '..', 'public', report.fileUrl);
        if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
      }
    });

    // Cascading DB delete
    await MedicalHistory.deleteMany({ userId: req.user._id });
    await MedicalReport.deleteMany({ userId: req.user._id });
    await Appointment.deleteMany({ patient: req.user._id });
    await Cart.deleteMany({ user: req.user._id });
    // Assuming Conversation schema has a user ref. If it throws error, we'll gracefully ignore or fix.
    try { await Conversation.deleteMany({ userId: req.user._id }); } catch (e) {}
    try { await ChatSession.deleteMany({ user: req.user._id }); } catch (e) {}

    await User.findByIdAndDelete(req.user._id);
    
    res.json({ success: true, message: 'Account and all associated data permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// --- Medical History ---

const getMedicalHistory = async (req, res) => {
  try {
    const history = await MedicalHistory.find({ userId: req.user._id }).sort({ visitDate: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const addMedicalHistory = async (req, res) => {
  try {
    const newRecord = new MedicalHistory({
      userId: req.user._id,
      ...req.body
    });
    const savedRecord = await newRecord.save();
    res.status(201).json({ success: true, record: savedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const updateMedicalHistory = async (req, res) => {
  try {
    const record = await MedicalHistory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const deleteMedicalHistory = async (req, res) => {
  try {
    const record = await MedicalHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// --- Medical Reports ---

const getReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ userId: req.user._id }).sort({ uploadDate: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const newReport = new MedicalReport({
      userId: req.user._id,
      reportName: req.body.reportName || req.file.originalname,
      category: req.body.category || 'Other',
      fileUrl: `/uploads/reports/${req.file.filename}`,
      fileSize: req.file.size
    });

    const savedReport = await newReport.save();
    res.status(201).json({ success: true, report: savedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const renameReport = async (req, res) => {
  try {
    const report = await MedicalReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { reportName: req.body.reportName },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '..', 'public', report.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  removeProfilePhoto,
  changePassword,
  deleteAccount,
  getMedicalHistory,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  getReports,
  uploadReport,
  renameReport,
  deleteReport
};
