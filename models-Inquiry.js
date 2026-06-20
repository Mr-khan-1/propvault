const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  userDetails: {
    name: String,
    email: String,
    phone: String
  },
  message: {
    type: String,
    required: true
  },
  inquiryType: {
    type: String,
    enum: ['general', 'scheduling', 'negotiation', 'complaint'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'scheduled', 'closed', 'solved'],
    default: 'pending'
  },
  scheduledDate: Date,
  agentResponse: {
    message: String,
    respondedAt: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  attachments: [String], // URLs of attached files
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
inquirySchema.index({ propertyId: 1 });
inquirySchema.index({ userId: 1 });
inquirySchema.index({ agentId: 1 });
inquirySchema.index({ status: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
