const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  category: { type: String, required: true },
  manufacturer: { type: String },
  description: { type: String },
  dosage: { type: String },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  discount: { type: String },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  stock: { type: String, default: 'In Stock' },
  prescriptionRequired: { type: Boolean, default: false },
  quantity: { type: String }, // e.g., '10 tablets', '100ml'
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
