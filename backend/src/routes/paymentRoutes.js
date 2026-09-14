const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  getInvoice
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.get('/:bookingId/invoice', getInvoice);

module.exports = router;
