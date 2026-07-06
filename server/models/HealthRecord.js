const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  heartRate: { type: Number },
  bloodPressure: { type: String },
  steps: { type: Number },
  insurance: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
