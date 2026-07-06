const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Existing Patient Portal fields
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, default: 0 },
  experience: { type: String, required: true },
  location: { type: String, required: true }, // Patient portal uses this
  fee: { type: Number, required: true },
  image: { type: String, default: '' },
  
  // New Doctor Portal fields
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // select: false prevents leaking to Patient portal
  medicalRegistrationNumber: { type: String, required: true },
  qualification: { type: String, required: true },
  hospital: { type: String, required: true },
  languagesKnown: { type: [String], default: [] },
  city: { type: String, required: true },
  state: { type: String, required: true },
  availableDays: { type: [String], default: [] },
  availableTime: { 
    start: { type: String },
    end: { type: String }
  },
  bio: { type: String, default: '' },
  
  // Additional Doctor Portal features
  isApproved: { type: Boolean, default: false } // optional, for admin flow
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
