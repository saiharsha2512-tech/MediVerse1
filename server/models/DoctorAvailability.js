const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, unique: true },
  days: [{
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    slots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }]
  }],
  unavailableDates: [{ type: Date }]
}, { timestamps: true });

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
