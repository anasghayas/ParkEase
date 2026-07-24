const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

// @route   POST /api/bookings
// @desc    Create a new booking (Customer)
exports.createBooking = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Parking slot not found' });
    if (!slot.isAvailable) return res.status(400).json({ message: 'Slot is currently unavailable' });

    // Calculate total price based on hours
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end - start;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const totalPrice = parseFloat((diffInHours * slot.pricePerHour).toFixed(2));

    const booking = new Booking({
      slotId,
      customerId: req.user.id,
      ownerId: slot.ownerId,
      startTime,
      endTime,
      totalPrice,
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for the logged-in customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('slotId', 'address city pricePerHour image')
      .populate('ownerId', 'name phone');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/bookings/requests
// @desc    Get booking requests for the logged-in owner's slots
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user.id })
      .populate('slotId', 'address city slotSize')
      .populate('customerId', 'name phone');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (Owner)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Only allow specific statuses
    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
