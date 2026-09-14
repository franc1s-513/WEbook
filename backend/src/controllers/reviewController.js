const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
const addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID and rating (1-5) are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed services' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      bookingId,
      userId: req.user._id,
      rating: Number(rating),
      comment: comment || ''
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate({
        path: 'bookingId',
        populate: { path: 'serviceIds', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review for a specific booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
const getBookingReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId }).populate('userId', 'name');
    res.json({
      success: true,
      data: review || null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getReviews,
  getBookingReview
};
