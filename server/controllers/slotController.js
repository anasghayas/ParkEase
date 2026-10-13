const ParkingSlot = require('../models/ParkingSlot');

// @route   POST /api/slots
// @desc    Add a new parking slot (Owners only)
exports.addSlot = async (req, res) => {
  try {
    const { address, area, city, state, slotSize, vehicleCompatibility, pricePerHour } = req.body;

    const newSlot = new ParkingSlot({
      ownerId: req.user.id,
      address,
      area,
      city,
      state,
      slotSize,
      vehicleCompatibility: vehicleCompatibility ? vehicleCompatibility.split(',') : [],
      pricePerHour,
      image: req.file ? req.file.path : '',
    });

    const savedSlot = await newSlot.save();
    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/slots
// @desc    Get all approved slots (For Customers searching)
exports.getAllSlots = async (req, res) => {
  try {
    const { city, state, area } = req.query;
    
    // Build search query
    let query = { isApproved: true, isAvailable: true };
    if (state) {
      query.state = { $regex: new RegExp(state, 'i') };
    }
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }
    if (area) {
      query.area = { $regex: new RegExp(area, 'i') };
    }

    const slots = await ParkingSlot.find(query).populate('ownerId', 'name phone');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/slots/locations
// @desc    Get available states, cities, and areas for filtering
exports.getLocations = async (req, res) => {
  try {
    const { state, city } = req.query;
    let match = { isApproved: true, isAvailable: true };
    if (state) match.state = state;
    if (city) match.city = city;

    if (!state && !city) {
      const states = await ParkingSlot.distinct('state', match);
      const cities = await ParkingSlot.distinct('city', match);
      return res.json({ states: states.sort(), cities: cities.sort() });
    }
    if (state && !city) {
      const cities = await ParkingSlot.distinct('city', match);
      return res.json({ cities: cities.sort() });
    }
    if (city) {
      const areas = await ParkingSlot.distinct('area', match);
      return res.json({ areas: areas.sort() });
    }
    
    res.json({});
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/slots/:id
// @desc    Get a single slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id).populate('ownerId', 'name phone');
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/slots/my-slots
// @desc    Get slots owned by the logged-in owner
exports.getMySlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   DELETE /api/slots/:id
// @desc    Delete a slot (Owner only)
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!slot) return res.status(404).json({ message: 'Slot not found or unauthorized' });

    await slot.deleteOne();
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};