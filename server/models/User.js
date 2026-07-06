const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Existing/Modified Base Fields
  name: { type: String, required: true }, // Keeping name for backward compatibility, but adding firstName/lastName as preferred
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true, sparse: true }, // sparse allows null/missing
  role: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor', 'Delivery'],
    default: 'Patient'
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: { type: String },

  // Personal Information
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  dob: { type: Date },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  bmi: { type: Number },
  
  // Address
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },
  
  // Additional Details
  emergencyContactName: { type: String },
  emergencyContactPhone: { type: String },
  occupation: { type: String },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', ''] },
  insuranceProvider: { type: String },
  insuranceNumber: { type: String },
  
  // Notification Preferences
  notifications: {
    appointments: { type: Boolean, default: true },
    medicines: { type: Boolean, default: true },
    aiAlerts: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Hash password before saving if it's modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
