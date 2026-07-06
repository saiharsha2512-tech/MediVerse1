const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Blood Report', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Prescription', 'Ultrasound', 'Medical Certificate', 'Other'],
    default: 'Other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
module.exports = MedicalReport;
