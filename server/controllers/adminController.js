const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

// @route   GET /api/admin/stats
// @desc    Get system wide stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSlots = await ParkingSlot.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    res.json({ totalUsers, totalSlots, totalBookings, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/admin/slots
// @desc    Get all slots (including unapproved)
exports.getAllSlotsForAdmin = async (req, res) => {
  try {
    const slots = await ParkingSlot.find().populate('ownerId', 'name email');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   PATCH /api/admin/slots/:id/approve
// @desc    Approve or reject a slot listing
exports.updateSlotApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
