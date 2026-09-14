const Booking = require('../models/Booking');

// @desc    Get jobs assigned to current mechanic
// @route   GET /api/mechanic/jobs
// @access  Private (Mechanic)
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Booking.find({ mechanicId: req.user._id })
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId')
      .sort({ date: 1, timeSlot: 1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status, mechanic notes, and parts used
// @route   PUT /api/mechanic/jobs/:id/status
// @access  Private (Mechanic)
const updateJobStatus = async (req, res, next) => {
  try {
    const { status, mechanicNotes, partsUsed } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      mechanicId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not assigned to you'
      });
    }

    if (status) {
      const allowed = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
      }
      booking.status = status;
    }

    if (mechanicNotes !== undefined) {
      booking.mechanicNotes = mechanicNotes;
    }

    if (partsUsed && Array.isArray(partsUsed)) {
      booking.partsUsed = partsUsed;
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceIds')
      .populate('branchId');

    res.json({
      success: true,
      message: 'Job progress updated successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyJobs,
  updateJobStatus
};
