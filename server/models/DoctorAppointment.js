const mongoose = require('mongoose');

const doctorAppointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, can be manually entered patient
  patientName: { type: String, required: true },
  patientPhoto: { type: String, default: '' },
  problem: { type: String, required: true },
  consultationType: { 
    type: String, 
    enum: ['Video Consultation', 'Chat Consultation', 'Hospital Visit'], 
    default: 'Video Consultation' 
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], 
    default: 'Upcoming' 
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DoctorAppointment', doctorAppointmentSchema);
