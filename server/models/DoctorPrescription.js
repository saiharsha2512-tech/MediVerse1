const mongoose = require('mongoose');

const doctorPrescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patientName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String }
  }],
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DoctorPrescription', doctorPrescriptionSchema);
