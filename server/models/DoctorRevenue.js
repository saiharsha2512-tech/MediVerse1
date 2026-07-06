const mongoose = require('mongoose');

const doctorRevenueSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorAppointment',
      default: null,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Patient identity (denormalized for query performance)
    patientName: { type: String, default: 'Unknown Patient' },

    // Consultation details
    consultationType: {
      type: String,
      enum: ['Video Consultation', 'Chat Consultation', 'Hospital Visit', 'Other'],
      default: 'Video Consultation',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Cash', 'Online', 'Insurance', 'Other'],
      default: 'Online',
    },
    transactionId: {
      type: String,
      default: () => 'TXN' + Date.now() + Math.floor(Math.random() * 10000),
    },

    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Refunded'],
      default: 'Completed',
    },
    date: { type: Date, default: Date.now },

    // Appointment snapshot for modal display
    appointmentDate: { type: String, default: '' },
    appointmentTime: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for fast date-range queries
doctorRevenueSchema.index({ doctorId: 1, date: -1 });

module.exports = mongoose.model('DoctorRevenue', doctorRevenueSchema);
