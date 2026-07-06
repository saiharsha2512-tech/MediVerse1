const mongoose = require('mongoose');

const doctorNotificationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  type: { type: String, enum: ['AppointmentBooked', 'AppointmentCancelled', 'ReportUploaded', 'PrescriptionPending', 'VideoCallStarted', 'System'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g., Appointment ID or Patient ID
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DoctorNotification', doctorNotificationSchema);
