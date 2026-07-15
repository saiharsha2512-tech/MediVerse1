const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  mode: { type: String, enum: ['Video', 'Chat'], default: 'Video' },
  status: { type: String, enum: ['pending', 'upcoming', 'completed', 'cancelled', 'rejected', 'confirmed'], default: 'upcoming' },
  meetingLink: { type: String, default: '' },
  consultationNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
