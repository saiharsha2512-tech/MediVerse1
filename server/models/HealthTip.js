const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Nutrition', 'Exercise', 'Sleep', 'Mental Wellness', 'Hydration']
  },
  tip: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthTip', healthTipSchema);
