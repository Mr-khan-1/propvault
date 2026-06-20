const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['apartment', 'house', 'villa', 'commercial', 'land'], required: true },
  purpose: { type: String, enum: ['sale', 'rent'], required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  area: { type: Number, required: true },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  parking: { type: Boolean, default: false },
  furnished: { type: String, enum: ['furnished', 'semi-furnished', 'unfurnished'], default: 'unfurnished' },
  images: { type: [String], default: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'] },
  address: {
    street: String,
    city: { type: String, required: true },
    district: String
  },
  amenities: [String],
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  status: { type: String, enum: ['available', 'sold', 'rented', 'pending'], default: 'available' },
  views: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0 }
}, { timestamps: true });

propertySchema.index({ 'address.city': 1, type: 1, purpose: 1 });
propertySchema.index({ agent: 1 });

module.exports = mongoose.model('Property', propertySchema);
