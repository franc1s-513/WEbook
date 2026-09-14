const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const Branch = require('../models/Branch');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already contains records. Skipping seed.');
      return;
    }

    console.log('Seeding database with initial accounts, services, branches, and sample bookings...');

    // 1. Create Users
    const admin = await User.create({
      name: 'Eleanor Vance (Service Director)',
      email: 'admin@webook.com',
      phone: '+1 (555) 010-0099',
      passwordHash: 'Admin@123',
      role: 'admin'
    });

    const mechanic1 = await User.create({
      name: 'Alex Walker (Lead Technician)',
      email: 'mechanic@webook.com',
      phone: '+1 (555) 010-0088',
      passwordHash: 'Mechanic@123',
      role: 'mechanic'
    });

    const mechanic2 = await User.create({
      name: 'David Miller (Diagnostic Specialist)',
      email: 'mechanic2@webook.com',
      phone: '+1 (555) 010-0077',
      passwordHash: 'Mechanic@123',
      role: 'mechanic'
    });

    const customer = await User.create({
      name: 'Francis Fernando',
      email: 'customer@webook.com',
      phone: '+1 (555) 010-0011',
      passwordHash: 'Customer@123',
      role: 'customer'
    });

    // 2. Create Branches
    const branchCentral = await Branch.create({
      name: 'Central Hub Auto Center',
      address: '742 Evergreen Terrace, Downtown District',
      city: 'Metro City',
      contactNumber: '+1 (555) 019-2834',
      workingHours: '08:00 AM - 06:00 PM',
      capacityPerSlot: 4
    });

    const branchWest = await Branch.create({
      name: 'Westside Super Service Hub',
      address: '880 Pacific Highway, Westside Commercial Park',
      city: 'Metro City',
      contactNumber: '+1 (555) 019-9944',
      workingHours: '08:30 AM - 07:00 PM',
      capacityPerSlot: 3
    });

    // 3. Create Vehicles for Customer
    const vehicle1 = await Vehicle.create({
      userId: customer._id,
      make: 'Toyota',
      model: 'Camry Hybrid',
      year: 2022,
      regNumber: 'WB-789-TX',
      fuelType: 'Hybrid'
    });

    const vehicle2 = await Vehicle.create({
      userId: customer._id,
      make: 'Tesla',
      model: 'Model 3 Dual Motor',
      year: 2023,
      regNumber: 'EV-442-NX',
      fuelType: 'Electric'
    });

    // 4. Create Services
    const service1 = await Service.create({
      name: 'Comprehensive Periodic Service',
      description: 'Engine oil flush, OEM filter replacement, 50-point safety inspection, brake wear check, fluid top-up, battery health check.',
      price: 149,
      durationMinutes: 120,
      category: 'General Maintenance',
      isActive: true
    });

    const service2 = await Service.create({
      name: 'Ceramic Brake Disc & Pad Overhaul',
      description: 'Front & rear performance brake pad replacement, rotor runout check, caliper lubrication, and hydraulic bleed test.',
      price: 135,
      durationMinutes: 90,
      category: 'Brakes & Suspension',
      isActive: true
    });

    const service3 = await Service.create({
      name: 'Climate Control & AC Antibacterial Flush',
      description: 'High pressure leak inspection, R134a/R1234yf gas replenishment, cabin micro-filter replacement, ultrasonic evaporator treatment.',
      price: 89,
      durationMinutes: 45,
      category: 'AC & Heating',
      isActive: true
    });

    const service4 = await Service.create({
      name: 'Laser Wheel Alignment & Dynamic Balancing',
      description: '3D computerized 4-wheel alignment, road-force balancing, tire tread depth scan, and suspension bushing inspection.',
      price: 65,
      durationMinutes: 45,
      category: 'Tyres & Wheels',
      isActive: true
    });

    const service5 = await Service.create({
      name: 'Advanced ECU Diagnostic Scan',
      description: 'OBD-II comprehensive digital fault scan, sensor calibration, real-time live telemetry logging, and wiring loom check.',
      price: 75,
      durationMinutes: 40,
      category: 'Electrical & Diagnostics',
      isActive: true
    });

    const service6 = await Service.create({
      name: 'Full Synthetic Oil & Filter Express',
      description: 'Premium synthetic 5W-30/0W-20 oil change, genuine filter element, sump washer replacement, and 20-point quick check.',
      price: 79,
      durationMinutes: 30,
      category: 'General Maintenance',
      isActive: true
    });

    // 5. Create Sample Bookings
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 5);

    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 1);

    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 2);

    // Completed Booking
    const completedBooking = await Booking.create({
      userId: customer._id,
      vehicleId: vehicle1._id,
      serviceIds: [service1._id, service4._id],
      branchId: branchCentral._id,
      mechanicId: mechanic1._id,
      date: formatDate(pastDate),
      timeSlot: '10:00 AM - 11:30 AM',
      status: 'COMPLETED',
      totalAmount: 214,
      paymentStatus: 'paid',
      paymentMethod: 'online',
      notes: 'Customer requested special attention to front brake squeak.',
      mechanicNotes: 'Replaced oil filter, completed full laser alignment. Front pads checked and cleaned, squeak resolved.',
      partsUsed: [
        { partName: 'Mobil 1 Synthetic 5W-30 (4.5L)', cost: 45 },
        { partName: 'Toyota Genuine Oil Filter', cost: 18 }
      ]
    });

    await Payment.create({
      bookingId: completedBooking._id,
      amount: 214,
      method: 'online',
      status: 'paid',
      transactionId: 'TXN-99882-ONL',
      paidAt: pastDate
    });

    await Review.create({
      bookingId: completedBooking._id,
      userId: customer._id,
      rating: 5,
      comment: 'Outstanding service! The car drives like new and the mechanic notes were very thorough.'
    });

    // Confirmed Booking (Mechanic Assigned)
    await Booking.create({
      userId: customer._id,
      vehicleId: vehicle2._id,
      serviceIds: [service3._id],
      branchId: branchCentral._id,
      mechanicId: mechanic1._id,
      date: formatDate(futureDate1),
      timeSlot: '02:00 PM - 03:30 PM',
      status: 'CONFIRMED',
      totalAmount: 89,
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      notes: 'AC has a slight musty smell after winter.'
    });

    // Pending Booking (Ready for admin approval)
    await Booking.create({
      userId: customer._id,
      vehicleId: vehicle1._id,
      serviceIds: [service2._id],
      branchId: branchWest._id,
      date: formatDate(futureDate2),
      timeSlot: '11:30 AM - 01:00 PM',
      status: 'PENDING',
      totalAmount: 135,
      paymentStatus: 'pending',
      paymentMethod: 'online',
      notes: 'Front brake pedal feels slightly spongy.'
    });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedDatabase;
