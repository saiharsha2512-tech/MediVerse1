const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, unique: true, trim: true },
    employeeId: { type: String, unique: true, sparse: true, trim: true },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Scooter', 'Cycle', 'Car', 'Van'],
      default: 'Bike',
    },
    vehicleNumber: { type: String, trim: true },
    drivingLicense: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    profileImage: { type: String, default: '' },
    availability: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Busy', 'Available'],
      default: 'Offline',
    },
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    todayDeliveries: { type: Number, default: 0 },
    weeklyDeliveries: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    weeklyEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    todayDistance: { type: Number, default: 0 },
    weeklyDistance: { type: Number, default: 0 },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
