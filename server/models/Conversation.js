const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt

module.exports = mongoose.model('Conversation', conversationSchema);
