const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const deliveryInfoSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  deliveryInfo: deliveryInfoSchema,
  paymentMethod: {
    type: String,
    required: true
  },
  subTotal: {
    type: Number,
    required: true
  },
  deliveryCharges: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Success', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Success'
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner'
  },
  distance: {
    type: Number,
    default: 0
  },
  earning: {
    type: Number,
    default: 0
  },
  acceptedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Accepted', 'Picked Up', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  estimatedTime: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
