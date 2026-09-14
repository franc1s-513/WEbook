const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviews,
  getBookingReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getReviews);
router.post('/', protect, addReview);
router.get('/booking/:bookingId', protect, getBookingReview);

module.exports = router;
