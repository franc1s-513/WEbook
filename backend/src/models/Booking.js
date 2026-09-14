const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
      }
    ],
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch'
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Booking date is required']
    },
    timeSlot: {
      type: String, // e.g., "09:00 AM - 10:30 AM"
      required: [true, 'Time slot is required']
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cash'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cash'],
      default: 'cash'
    },
    notes: {
      type: String,
      default: ''
    },
    mechanicNotes: {
      type: String,
      default: ''
    },
    partsUsed: [
      {
        partName: String,
        cost: Number
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
