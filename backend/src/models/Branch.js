const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      default: 'Metro City'
    },
    contactNumber: {
      type: String,
      default: '+1 (555) 019-2834'
    },
    workingHours: {
      type: String,
      default: '08:00 AM - 06:00 PM'
    },
    capacityPerSlot: {
      type: Number,
      default: 3
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Branch', branchSchema);
