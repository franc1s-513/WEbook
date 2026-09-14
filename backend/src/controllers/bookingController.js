const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const Branch = require('../models/Branch');
const Payment = require('../models/Payment');

const STANDARD_SLOTS = [
  '08:30 AM - 10:00 AM',
  '10:00 AM - 11:30 AM',
  '11:30 AM - 01:00 PM',
  '01:30 PM - 03:00 PM',
  '03:00 PM - 04:30 PM',
  '04:30 PM - 06:00 PM'
];

// @desc    Get available slots for a date & branch
// @route   GET /api/bookings/slots
// @access  Public / Private
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date, branchId } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required (YYYY-MM-DD)' });
    }

    let capacityPerSlot = 3;
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (branch && branch.capacityPerSlot) {
        capacityPerSlot = branch.capacityPerSlot;
      }
    }

    // Query existing non-cancelled bookings for this date
    const query = {
      date,
      status: { $ne: 'CANCELLED' }
    };
    if (branchId) {
      query.branchId = branchId;
    }

    const bookings = await Booking.find(query).select('timeSlot');

    // Count bookings per slot
    const slotCounts = {};
    STANDARD_SLOTS.forEach((slot) => {
      slotCounts[slot] = 0;
    });

    bookings.forEach((b) => {
      if (slotCounts[b.timeSlot] !== undefined) {
        slotCounts[b.timeSlot] += 1;
      }
    });

    const slots = STANDARD_SLOTS.map((slot) => {
      const bookedCount = slotCounts[slot] || 0;
      return {
        timeSlot: slot,
        capacity: capacityPerSlot,
        bookedCount,
        availableSeats: Math.max(0, capacityPerSlot - bookedCount),
        isAvailable: bookedCount < capacityPerSlot
      };
    });

    res.json({
      success: true,
      data: {
        date,
        branchId: branchId || null,
        slots
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, serviceIds, branchId, date, timeSlot, paymentMethod, notes } = req.body;

    if (!vehicleId || !serviceIds || !serviceIds.length || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicleId, serviceIds, date, and timeSlot'
      });
    }

    // 1. Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user._id });
    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'Selected vehicle not found or does not belong to you' });
    }

    // 2. Fetch services and calculate total
    const services = await Service.find({ _id: { $in: serviceIds }, isActive: true });
    if (!services.length) {
      return res.status(400).json({ success: false, message: 'None of the selected services are valid' });
    }

    const totalAmount = services.reduce((sum, s) => sum + s.price, 0);

    // 3. Check slot capacity
    let defaultBranch = branchId;
    if (!defaultBranch) {
      const firstBranch = await Branch.findOne();
      defaultBranch = firstBranch ? firstBranch._id : null;
    }

    const branch = defaultBranch ? await Branch.findById(defaultBranch) : null;
    const capacity = branch ? branch.capacityPerSlot : 3;

    const existingCount = await Booking.countDocuments({
      date,
      timeSlot,
      branchId: defaultBranch,
      status: { $ne: 'CANCELLED' }
    });

    if (existingCount >= capacity) {
      return res.status(400).json({
        success: false,
        message: `The selected time slot (${timeSlot}) on ${date} has reached full capacity. Please select another slot.`
      });
    }

    // 4. Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      vehicleId,
      serviceIds: services.map((s) => s._id),
      branchId: defaultBranch,
      date,
      timeSlot,
      status: 'PENDING',
      totalAmount,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      paymentMethod: paymentMethod || 'cash',
      notes: notes || ''
    });

    // 5. If online payment selected, create simulated payment record
    if (paymentMethod === 'online') {
      await Payment.create({
        bookingId: booking._id,
        amount: totalAmount,
        method: 'online',
        status: 'paid'
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId');

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully',
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId')
      .populate('mechanicId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId')
      .populate('mechanicId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: customer owner, assigned mechanic, or admin
    const isOwner = req.user.role === 'customer' && booking.userId._id.toString() === req.user._id.toString();
    const isMechanic = req.user.role === 'mechanic' && booking.mechanicId && booking.mechanicId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMechanic && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure customer owns booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed service' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};
