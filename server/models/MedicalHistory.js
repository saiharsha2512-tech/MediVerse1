const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  specialization: {
    type: String
  },
  hospital: {
    type: String
  },
  diagnosis: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  prescription: {
    type: String
  },
  visitDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
module.exports = MedicalHistory;
