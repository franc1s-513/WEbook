const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  updateBookingStatus,
  assignMechanic,
  getReports,
  getMechanics,
  getBranches
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/bookings/:id/assign', assignMechanic);
router.get('/reports', getReports);
router.get('/mechanics', getMechanics);
router.get('/branches', getBranches);

module.exports = router;
