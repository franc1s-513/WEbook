const express = require('express');
const router = express.Router();
const {
  getMyVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All vehicle routes require authentication

router.route('/')
  .get(getMyVehicles)
  .post(addVehicle);

router.route('/:id')
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;
