const mongoose = require('mongoose');

const doctorChatSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorAppointment', required: true },
  sender: { type: String, enum: ['Doctor', 'Patient'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DoctorChat', doctorChatSchema);
