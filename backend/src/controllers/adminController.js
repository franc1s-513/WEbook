const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Branch = require('../models/Branch');

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, date, branchId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (branchId) filter.branchId = branchId;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
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

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId')
      .populate('mechanicId', 'name email phone');

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign mechanic to booking
// @route   PUT /api/admin/bookings/:id/assign
// @access  Private (Admin)
const assignMechanic = async (req, res, next) => {
  try {
    const { mechanicId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (mechanicId) {
      const mechanic = await User.findOne({ _id: mechanicId, role: 'mechanic' });
      if (!mechanic) {
        return res.status(400).json({ success: false, message: 'Selected staff member is not a valid mechanic' });
      }
      booking.mechanicId = mechanic._id;
      if (booking.status === 'PENDING') {
        booking.status = 'CONFIRMED';
      }
    } else {
      booking.mechanicId = null;
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId')
      .populate('mechanicId', 'name email phone');

    res.json({
      success: true,
      message: 'Mechanic assigned successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics & reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const allBookings = await Booking.find().populate('serviceIds');

    const totalBookings = allBookings.length;
    const totalRevenue = allBookings
      .filter((b) => b.status === 'COMPLETED' || b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const statusCounts = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    allBookings.forEach((b) => {
      if (statusCounts[b.status] !== undefined) {
        statusCounts[b.status] += 1;
      }
    });

    // Count popular services
    const servicePopularity = {};
    allBookings.forEach((b) => {
      if (b.serviceIds && Array.isArray(b.serviceIds)) {
        b.serviceIds.forEach((svc) => {
          if (svc && svc.name) {
            servicePopularity[svc.name] = (servicePopularity[svc.name] || 0) + 1;
          }
        });
      }
    });

    const popularServices = Object.keys(servicePopularity)
      .map((name) => ({ name, count: servicePopularity[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Bookings per day (recent dates)
    const bookingsByDate = {};
    allBookings.forEach((b) => {
      if (b.date) {
        bookingsByDate[b.date] = (bookingsByDate[b.date] || 0) + 1;
      }
    });

    const dailyTrends = Object.keys(bookingsByDate)
      .sort()
      .slice(-7)
      .map((date) => ({ date, count: bookingsByDate[date] }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        statusCounts,
        popularServices,
        dailyTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mechanics staff list
// @route   GET /api/admin/mechanics
// @access  Private (Admin)
const getMechanics = async (req, res, next) => {
  try {
    const mechanics = await User.find({ role: 'mechanic' }).select('-passwordHash');
    res.json({
      success: true,
      data: mechanics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get branches list
// @route   GET /api/admin/branches
// @access  Public / Private
const getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find();
    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  updateBookingStatus,
  assignMechanic,
  getReports,
  getMechanics,
  getBranches
};
