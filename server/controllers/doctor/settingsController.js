const Doctor = require('../../models/Doctor');
const bcrypt = require('bcryptjs');

/* ─────────────────────────────────────────────────────────────
   PUT /api/doctor/settings
   Handles:
     - notification preferences  (body.notifications)
     - availability settings      (body.availability)
   Password change is handled via PUT /api/doctor/password
   ───────────────────────────────────────────────────────────── */
const updateSettings = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { notifications, availability } = req.body;

    if (notifications !== undefined) {
      doctor.notifications = { ...(doctor.notifications || {}), ...notifications };
    }

    if (availability !== undefined) {
      // Store simple availability (days + time range) directly on Doctor doc
      if (availability.availableDays !== undefined) {
        doctor.availableDays = availability.availableDays;
      }
      if (availability.availableTime !== undefined) {
        doctor.availableTime = availability.availableTime;
      }
    }

    await doctor.save();
    res.json({ success: true, message: 'Settings updated', data: { notifications: doctor.notifications, availableDays: doctor.availableDays, availableTime: doctor.availableTime } });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/doctor/password
   Fields: currentPassword, newPassword, confirmPassword
   ───────────────────────────────────────────────────────────── */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    const doctor = await Doctor.findById(req.doctor._id).select('+password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(newPassword, salt);
    await doctor.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { updateSettings, changePassword };
