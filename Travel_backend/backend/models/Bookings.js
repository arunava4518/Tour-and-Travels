const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  ticketNumber: { type: String },
  primaryContact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    destination: { type: String, required: true },
    travelDate: { type: String, required: true }
  },
  members: [{
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    foodPreference: { type: String, enum: ['veg', 'non-veg'], default: 'veg' }
  }],
  tripDetails: {
    pickupLocation: { type: String, required: true },
    seatType: { type: String, enum: ['bed', 'normal'], required: true },
    requirements: { type: String },
    suggestions: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);