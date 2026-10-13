require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ParkingSlot = require('./models/ParkingSlot');
const Booking = require('./models/Booking');

const PARKING_IMAGES = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  'https://res.cloudinary.com/u0nubcs7/image/upload/v1784921887/parkease_slots/jrkpyacpc8kbstmulzhp.png',
];

const CITIES_DATA = {
  'Jharkhand': {
    'Jamshedpur': ['Bistupur', 'Sakchi', 'Sonari', 'Kadma', 'Telco', 'Mango'],
    'Ranchi': ['Lalpur', 'Doranda', 'Kanke Road', 'Harmu', 'Ratu Road'],
  },
  'Delhi': {
    'New Delhi': ['Connaught Place', 'Saket', 'Dwarka', 'Lajpat Nagar', 'Janakpuri'],
    'Central Delhi': ['Karol Bagh', 'Chandni Chowk', 'Paharganj', 'Rajendra Place'],
  },
  'Maharashtra': {
    'Mumbai': ['Andheri', 'Bandra', 'Colaba', 'Juhu', 'Lower Parel', 'Powai'],
    'Pune': ['Koregaon Park', 'Hinjewadi', 'Kothrud', 'Deccan', 'Viman Nagar'],
  },
  'Karnataka': {
    'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'MG Road', 'Jayanagar', 'HSR Layout'],
  },
  'West Bengal': {
    'Kolkata': ['Park Street', 'Salt Lake', 'New Town', 'Howrah', 'Esplanade', 'Gariahat'],
  },
  'Tamil Nadu': {
    'Chennai': ['T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Nungambakkam'],
  },
  'Telangana': {
    'Hyderabad': ['Banjara Hills', 'HITEC City', 'Gachibowli', 'Secunderabad', 'Jubilee Hills'],
  },
  'Rajasthan': {
    'Jaipur': ['MI Road', 'C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park'],
  },
  'Gujarat': {
    'Ahmedabad': ['CG Road', 'SG Highway', 'Navrangpura', 'Satellite', 'Maninagar'],
  },
  'Uttar Pradesh': {
    'Lucknow': ['Hazratganj', 'Gomti Nagar', 'Aminabad', 'Alambagh', 'Aliganj'],
    'Noida': ['Sector 18', 'Sector 62', 'Sector 15', 'Sector 44'],
  },
};

const ADDRESSES = [
  'Near City Center Mall', 'Opposite Metro Station Gate 2', 'Behind Main Market Road', 'Next to Central Park',
  'Near Railway Station Platform 1', 'Beside Grand Plaza Complex', 'Near Apex Hospital Road', 'Opposite Interstate Bus Stand',
  'Near Tech Park Tower A', 'Behind Municipal Corporation Office', 'Near University North Campus', 'Opposite Civil Lines Police Station',
  'Near Heritage Temple Road', 'Beside HP Petrol Pump', 'Near International Cricket Stadium', 'Behind Head Post Office',
  'Near Main Flyover Bridge', 'Opposite SBI Regional Hub', 'Near PVR Cinema Complex', 'Behind High Court Avenue',
];

const SLOT_SIZES = ['small', 'medium', 'large'];
const VEHICLE_COMBOS = [
  ['2-wheeler'],
  ['4-wheeler'],
  ['2-wheeler', '4-wheeler'],
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  const prices = [20, 30, 40, 50, 60, 75, 80, 100, 120, 150];
  return prices[Math.floor(Math.random() * prices.length)];
}

const seedSlots = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 1. Ensure Demo Driver exists
    let demoDriver = await User.findOne({ email: 'd@example.com' });
    if (!demoDriver) {
      demoDriver = await User.create({
        name: 'Demo Driver (John Doe)',
        email: 'd@example.com',
        phone: '9876543299',
        password: hashedPassword,
        role: 'customer',
        isApproved: true,
      });
      console.log('Created Demo Driver: d@example.com');
    } else {
      console.log('Demo Driver exists: d@example.com');
    }

    // 2. Ensure Owners exist (including Demo Owner p@example.com)
    const ownerData = [
      { name: 'Hunch (Demo Owner)', email: 'p@example.com', phone: '9876543210' },
      { name: 'Rajesh Kumar', email: 'owner1@parkease.com', phone: '9876543211' },
      { name: 'Priya Sharma', email: 'owner2@parkease.com', phone: '9876543212' },
      { name: 'Amit Patel', email: 'owner3@parkease.com', phone: '9876543213' },
      { name: 'Sunita Devi', email: 'owner4@parkease.com', phone: '9876543214' },
      { name: 'Vikram Singh', email: 'owner5@parkease.com', phone: '9876543215' },
    ];

    const owners = [];
    for (const od of ownerData) {
      let owner = await User.findOne({ email: od.email });
      if (!owner) {
        owner = await User.create({
          ...od,
          password: hashedPassword,
          role: 'owner',
          isApproved: true,
        });
        console.log('Created owner: ' + od.name);
      } else {
        console.log('Owner exists: ' + od.name);
      }
      owners.push(owner);
    }

    const demoOwner = owners.find(o => o.email === 'p@example.com');

    // 3. Clean up previously seeded slots for these owners
    const ownerIds = owners.map(o => o._id);
    const deletedSlots = await ParkingSlot.deleteMany({ ownerId: { $in: ownerIds } });
    console.log('Cleared ' + deletedSlots.deletedCount + ' old slots');

    // Clean up related bookings
    await Booking.deleteMany({ customerId: demoDriver._id });

    // 4. Generate Pan-India slots
    const slots = [];
    let slotCount = 0;

    for (const [state, cities] of Object.entries(CITIES_DATA)) {
      for (const [city, areas] of Object.entries(cities)) {
        for (const area of areas) {
          const numSlots = Math.random() > 0.3 ? 2 : 1;
          for (let i = 0; i < numSlots; i++) {
            const address = randomFrom(ADDRESSES) + ', ' + area;
            // Give demoOwner ~20% of slots including slots in Jamshedpur, Delhi, Mumbai
            const assignedOwner = Math.random() < 0.25 ? demoOwner : randomFrom(owners);
            
            slots.push({
              ownerId: assignedOwner._id,
              address,
              area,
              city,
              state,
              slotSize: randomFrom(SLOT_SIZES),
              vehicleCompatibility: randomFrom(VEHICLE_COMBOS),
              pricePerHour: randomPrice(),
              image: randomFrom(PARKING_IMAGES),
              isAvailable: true,
              isApproved: true,
            });
            slotCount++;
          }
        }
      }
    }

    const insertedSlots = await ParkingSlot.insertMany(slots);
    console.log('\nSuccessfully seeded ' + insertedSlots.length + ' parking slots across ' + Object.keys(CITIES_DATA).length + ' states!\n');

    // 5. Create realistic sample bookings for d@example.com & p@example.com
    const demoOwnerSlots = insertedSlots.filter(s => s.ownerId.toString() === demoOwner._id.toString());
    console.log('Demo Owner (p@example.com) owns ' + demoOwnerSlots.length + ' slots');

    if (demoOwnerSlots.length >= 2) {
      const now = new Date();
      // 1 Pending booking
      await Booking.create({
        slotId: demoOwnerSlots[0]._id,
        customerId: demoDriver._id,
        ownerId: demoOwner._id,
        startTime: new Date(now.getTime() + 2 * 3600 * 1000),
        endTime: new Date(now.getTime() + 6 * 3600 * 1000),
        totalPrice: demoOwnerSlots[0].pricePerHour * 4,
        status: 'pending',
      });

      // 1 Approved booking
      await Booking.create({
        slotId: demoOwnerSlots[1]._id,
        customerId: demoDriver._id,
        ownerId: demoOwner._id,
        startTime: new Date(now.getTime() + 24 * 3600 * 1000),
        endTime: new Date(now.getTime() + 27 * 3600 * 1000),
        totalPrice: demoOwnerSlots[1].pricePerHour * 3,
        status: 'approved',
      });

      console.log('Created sample pending & approved bookings for demo testing');
    }

    for (const [state, cities] of Object.entries(CITIES_DATA)) {
      let stateTotal = 0;
      for (const [city, areas] of Object.entries(cities)) {
        const cCount = slots.filter(s => s.city === city).length;
        stateTotal += cCount;
      }
      console.log('  - ' + state + ': ' + stateTotal + ' slots');
    }

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedSlots();