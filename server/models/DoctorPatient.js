const mongoose = require('mongoose');

/**
 * DoctorPatient – Doctor Portal collection only.
 *
 * Stores doctor-specific metadata about a patient.
 * Identity fields (name, age, phone, email, photo) are resolved
 * from the referenced User document at query time.
 *
 * This model is NEVER accessed by the Patient Portal.
 */
const doctorPatientSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },

    // Reference to the Patient Portal User (read-only from here)
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Fallback identity fields used when patientId is null
    // (manually added patients who have no portal account)
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    profileImage: { type: String, default: '' },

    // Doctor-managed metadata
    conditions: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Critical', 'Stable', 'Monitoring'],
      default: 'Stable',
    },
    lastVisit: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound index: one record per doctor+patient pair
doctorPatientSchema.index({ doctorId: 1, patientId: 1 }, { sparse: true });

module.exports = mongoose.model('DoctorPatient', doctorPatientSchema);
