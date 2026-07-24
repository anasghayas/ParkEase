const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  slotSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  vehicleCompatibility: [{
    type: String,
    enum: ['2-wheeler', '4-wheeler'],
  }],
  pricePerHour: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // Cloudinary URL
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false, // Admins must approve the slot before it appears to customers
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
