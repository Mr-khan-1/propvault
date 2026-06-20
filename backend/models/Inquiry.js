const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  message: { type: String, required: true },
  inquiryType: { type: String, enum: ['general', 'scheduling', 'negotiation'], default: 'general' },
  status: { type: String, enum: ['pending', 'contacted', 'scheduled', 'closed', 'solved'], default: 'pending' },
  scheduledDate: Date,
  agentResponse: { message: String, respondedAt: Date },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
