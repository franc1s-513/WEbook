const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: 0
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    category: {
      type: String,
      enum: ['General Maintenance', 'Brakes & Suspension', 'AC & Heating', 'Tyres & Wheels', 'Electrical & Diagnostics', 'Engine & Transmission', 'Body & Detailing'],
      default: 'General Maintenance'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Service', serviceSchema);
