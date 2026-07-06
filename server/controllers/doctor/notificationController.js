const DoctorNotification = require('../../models/DoctorNotification');

// @desc    Get all notifications for doctor
// @route   GET /api/doctor/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await DoctorNotification.find({ doctorId: req.doctor._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/doctor/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await DoctorNotification.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
