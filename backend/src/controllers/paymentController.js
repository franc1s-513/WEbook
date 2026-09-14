const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create payment order (simulated)
// @route   POST /api/payments/create
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, method } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      amount: amount || booking.totalAmount,
      method: method || 'online',
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Payment order initiated',
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        currency: 'USD',
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and update booking
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentId, method } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let payment;
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    }

    if (!payment) {
      payment = await Payment.create({
        bookingId: booking._id,
        amount: booking.totalAmount,
        method: method || 'online',
        status: 'paid'
      });
    } else {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = payment.method;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified and marked as paid',
      data: {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice data for a booking
// @route   GET /api/payments/:bookingId/invoice
// @access  Private
const getInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId')
      .populate('mechanicId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check: customer owner or admin
    if (
      req.user.role === 'customer' &&
      booking.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });

    // Calculate parts total
    const partsTotal = (booking.partsUsed || []).reduce((sum, p) => sum + (p.cost || 0), 0);
    const servicesTotal = booking.totalAmount;
    const subtotal = servicesTotal + partsTotal;
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
    const grandTotal = Math.round((subtotal + tax) * 100) / 100;

    const invoice = {
      invoiceNumber: `INV-${booking._id.toString().slice(-6).toUpperCase()}`,
      issueDate: booking.updatedAt || booking.createdAt,
      bookingDetails: {
        id: booking._id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status
      },
      customer: {
        name: booking.userId.name,
        email: booking.userId.email,
        phone: booking.userId.phone
      },
      vehicle: {
        make: booking.vehicleId ? booking.vehicleId.make : 'Unknown',
        model: booking.vehicleId ? booking.vehicleId.model : '',
        year: booking.vehicleId ? booking.vehicleId.year : '',
        regNumber: booking.vehicleId ? booking.vehicleId.regNumber : '',
        fuelType: booking.vehicleId ? booking.vehicleId.fuelType : ''
      },
      branch: booking.branchId || {
        name: 'WEbook Service Center',
        address: '742 Evergreen Terrace, Downtown'
      },
      mechanic: booking.mechanicId ? booking.mechanicId.name : 'Service Team',
      items: [
        ...(booking.serviceIds || []).map((s) => ({
          description: s.name,
          category: s.category,
          amount: s.price
        })),
        ...(booking.partsUsed || []).map((p) => ({
          description: `Part: ${p.partName}`,
          category: 'Replacement Part',
          amount: p.cost
        }))
      ],
      pricing: {
        servicesTotal,
        partsTotal,
        subtotal,
        tax,
        grandTotal
      },
      payment: {
        method: booking.paymentMethod,
        status: booking.paymentStatus,
        transactionId: payment ? payment.transactionId : 'N/A',
        paidAt: payment ? payment.paidAt : null
      }
    };

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  getInvoice
};
