const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide property title'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'commercial', 'land'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide price']
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR']
  },
  area: {
    type: Number,
    required: true // in square meters
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  kitchen: {
    type: Boolean,
    default: true
  },
  parking: {
    type: Boolean,
    default: false
  },
  garden: {
    type: Boolean,
    default: false
  },
  furnished: {
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished'],
    default: 'unfurnished'
  },
  images: [{
    type: String,
    required: true
  }],
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    district: String,
    country: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  amenities: [String], // ['gym', 'pool', 'parking', 'security', 'garden']
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  postedBy: {
    type: String,
    enum: ['agent', 'user'],
    default: 'agent'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'pending'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
propertySchema.index({ city: 1, type: 1, purpose: 1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
