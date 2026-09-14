const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles for current user
// @route   GET /api/vehicles
// @access  Private
const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Private
const addVehicle = async (req, res, next) => {
  try {
    const { make, model, year, regNumber, fuelType } = req.body;

    if (!make || !model || !year || !regNumber) {
      return res.status(400).json({
        success: false,
        message: 'Make, model, year, and registration number are required'
      });
    }

    const vehicle = await Vehicle.create({
      userId: req.user._id,
      make,
      model,
      year: Number(year),
      regNumber: regNumber.toUpperCase().trim(),
      fuelType: fuelType || 'Petrol'
    });

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Ensure user owns vehicle or is admin
    if (vehicle.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
    }

    const { make, model, year, regNumber, fuelType } = req.body;
    if (make) vehicle.make = make;
    if (model) vehicle.model = model;
    if (year) vehicle.year = Number(year);
    if (regNumber) vehicle.regNumber = regNumber.toUpperCase().trim();
    if (fuelType) vehicle.fuelType = fuelType;

    await vehicle.save();

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
};
