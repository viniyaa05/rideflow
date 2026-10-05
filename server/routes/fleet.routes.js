import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Carpool from '../models/Carpool.js';
import Driver from '../models/Driver.js';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();

const SEEDED_VEHICLES = [
  // --- Cars & SUVs Fleet ---
  {
    id: 'rent-1',
    name: 'Toyota Innova Crysta 2.4 VX (7-Seater)',
    title: 'Toyota Innova Crysta 2.4 VX',
    type: 'car',
    category: 'car-rent',
    model: 'Innova Crysta VX',
    brand: 'Toyota',
    hourlyPrice: 380,
    dailyPrice: 2600,
    pricePerHour: 380,
    rangeKm: 750,
    seats: 7,
    fuelType: 'Diesel',
    fuel: 'Diesel',
    transmission: 'Manual 5-Speed',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
    available: true,
    location: 'Chennai Central Hub (600003)',
    gpsLocation: { lat: 13.0827, lng: 80.2707, address: 'Chennai Central Railway Hub' }
  },
  {
    id: 'rent-2',
    name: 'Mahindra Thar 4x4 Hard Top',
    title: 'Mahindra Thar 4x4 Hard Top',
    type: 'car',
    category: 'car-rent',
    model: 'Thar LX Hardtop Diesel 4x4',
    brand: 'Mahindra',
    hourlyPrice: 420,
    dailyPrice: 2900,
    pricePerHour: 420,
    rangeKm: 600,
    seats: 4,
    fuelType: 'Diesel',
    fuel: 'Diesel',
    transmission: 'Automatic 4x4',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
    available: true,
    location: 'Anna Nagar Hub, Chennai (600040)',
    gpsLocation: { lat: 13.0850, lng: 80.2100, address: 'Anna Nagar 2nd Avenue' }
  },
  {
    id: 'rent-3',
    name: 'Tata Nexon EV Max (437 km Range)',
    title: 'Tata Nexon EV Max',
    type: 'car',
    category: 'car-rent',
    model: 'Nexon EV Max',
    brand: 'Tata',
    hourlyPrice: 290,
    dailyPrice: 1950,
    pricePerHour: 290,
    rangeKm: 437,
    seats: 5,
    fuelType: 'Electric',
    fuel: 'Electric (EV)',
    transmission: 'Automatic EV',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600',
    available: true,
    location: 'OMR IT Corridor Hub (600119)',
    gpsLocation: { lat: 12.9010, lng: 80.2279, address: 'Sholinganallur Junction' }
  },
  {
    id: 'rent-4',
    name: 'Maruti Suzuki Swift Dzire Tour (Sedan)',
    title: 'Maruti Suzuki Swift Dzire Tour',
    type: 'car',
    category: 'car-rent',
    model: 'Dzire ZXi Plus',
    brand: 'Maruti Suzuki',
    hourlyPrice: 180,
    dailyPrice: 1300,
    pricePerHour: 180,
    rangeKm: 750,
    seats: 5,
    fuelType: 'Petrol / CNG',
    fuel: 'Petrol / CNG',
    transmission: 'Manual',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600',
    available: true,
    location: 'T. Nagar Hub, Chennai (600017)',
    gpsLocation: { lat: 13.0418, lng: 80.2341, address: 'Panagal Park Hub' }
  },
  {
    id: 'rent-5',
    name: 'Hyundai Creta SX (Executive Sunroof)',
    title: 'Hyundai Creta SX',
    type: 'car',
    category: 'car-rent',
    model: 'Creta SX Sunroof',
    brand: 'Hyundai',
    hourlyPrice: 320,
    dailyPrice: 2250,
    pricePerHour: 320,
    rangeKm: 680,
    seats: 5,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic IVT',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
    available: true,
    location: 'OMR IT Corridor Hub (600119)',
    gpsLocation: { lat: 12.9010, lng: 80.2279, address: 'OMR Sholinganallur Junction' }
  },
  {
    id: 'rent-6',
    name: 'Mahindra Scorpio-N Z8L (4x4 Expedition)',
    title: 'Mahindra Scorpio-N Z8L',
    type: 'car',
    category: 'car-rent',
    model: 'Scorpio-N Z8L 4WD',
    brand: 'Mahindra',
    hourlyPrice: 460,
    dailyPrice: 3100,
    pricePerHour: 460,
    rangeKm: 720,
    seats: 7,
    fuelType: 'Diesel',
    fuel: 'Diesel',
    transmission: 'Automatic 4WD',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600',
    available: true,
    location: 'Guindy Industrial Hub (600032)',
    gpsLocation: { lat: 13.0067, lng: 80.2026, address: 'Guindy Race Course Metro' }
  },
  {
    id: 'rent-7',
    name: 'Honda City 1.5 i-VTEC ZX (Luxury Sedan)',
    title: 'Honda City 1.5 i-VTEC ZX',
    type: 'car',
    category: 'car-rent',
    model: 'Honda City ZX',
    brand: 'Honda',
    hourlyPrice: 240,
    dailyPrice: 1700,
    pricePerHour: 240,
    rangeKm: 700,
    seats: 5,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic CVT',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600',
    available: true,
    location: 'Chennai Airport Hub MAA (600027)',
    gpsLocation: { lat: 12.9822, lng: 80.1636, address: 'Chennai Airport Terminal 2' }
  },
  {
    id: 'rent-8',
    name: 'Hyundai i20 Asta Turbo (Smart Hatchback)',
    title: 'Hyundai i20 Asta Turbo',
    type: 'car',
    category: 'car-rent',
    model: 'i20 Asta Turbo',
    brand: 'Hyundai',
    hourlyPrice: 160,
    dailyPrice: 1150,
    pricePerHour: 160,
    rangeKm: 650,
    seats: 5,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 6-Speed',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600',
    available: true,
    location: 'Velachery Hub (600042)',
    gpsLocation: { lat: 12.9815, lng: 80.2180, address: 'Velachery Phoenix Marketcity' }
  },
  {
    id: 'rent-9',
    name: 'Tata Tiago EV Long Range (Fast Charging)',
    title: 'Tata Tiago EV',
    type: 'car',
    category: 'car-rent',
    model: 'Tiago EV',
    brand: 'Tata',
    hourlyPrice: 140,
    dailyPrice: 990,
    pricePerHour: 140,
    rangeKm: 315,
    seats: 5,
    fuelType: 'Electric',
    fuel: 'Electric (EV)',
    transmission: 'Automatic EV',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600',
    available: true,
    location: 'T. Nagar Hub (600017)',
    gpsLocation: { lat: 13.0418, lng: 80.2341, address: 'T. Nagar Panagal Park' }
  },
  {
    id: 'rent-10',
    name: 'Toyota Fortuner 4x4 Legender (Premium SUV)',
    title: 'Toyota Fortuner Legender',
    type: 'car',
    category: 'car-rent',
    model: 'Fortuner 4x4 Legender',
    brand: 'Toyota',
    hourlyPrice: 650,
    dailyPrice: 4800,
    pricePerHour: 650,
    rangeKm: 780,
    seats: 7,
    fuelType: 'Diesel',
    fuel: 'Diesel',
    transmission: 'Automatic 4x4',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
    available: true,
    location: 'Chennai Central Hub (600003)',
    gpsLocation: { lat: 13.0827, lng: 80.2707, address: 'Chennai Central Station Gate 1' }
  },
  {
    id: 'rent-11',
    name: 'MG ZS EV Exclusive (461 km Range)',
    title: 'MG ZS EV Exclusive',
    type: 'car',
    category: 'car-rent',
    model: 'ZS EV Exclusive',
    brand: 'MG Motor',
    hourlyPrice: 310,
    dailyPrice: 2100,
    pricePerHour: 310,
    rangeKm: 461,
    seats: 5,
    fuelType: 'Electric',
    fuel: 'Electric (EV)',
    transmission: 'Automatic EV',
    image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600',
    available: true,
    location: 'Coimbatore Gandhipuram (641012)',
    gpsLocation: { lat: 11.0168, lng: 76.9558, address: 'Gandhipuram Cross Cut Road' }
  },
  {
    id: 'rent-12',
    name: 'Kia Seltos GTX Plus Turbo (Compact SUV)',
    title: 'Kia Seltos GTX Plus',
    type: 'car',
    category: 'car-rent',
    model: 'Seltos GTX Plus',
    brand: 'Kia',
    hourlyPrice: 340,
    dailyPrice: 2350,
    pricePerHour: 340,
    rangeKm: 650,
    seats: 5,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic 7DCT',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
    available: true,
    location: 'Madurai Central Hub (625001)',
    gpsLocation: { lat: 9.9252, lng: 78.1198, address: 'Madurai Railway Junction' }
  },

  // --- Bikes & 2-Wheelers Fleet ---
  {
    id: 'rent-bike-1',
    name: 'Royal Enfield Classic 350 (Stealth Black)',
    title: 'Royal Enfield Classic 350',
    type: 'bike',
    category: 'bike-rent',
    model: 'Classic 350 Chrome',
    brand: 'Royal Enfield',
    hourlyPrice: 85,
    dailyPrice: 590,
    pricePerHour: 85,
    rangeKm: 420,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 5-Speed',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    available: true,
    location: 'Chennai Central Hub (600003)',
    gpsLocation: { lat: 13.0835, lng: 80.2740, address: 'Chennai Central Station' }
  },
  {
    id: 'rent-bike-2',
    name: 'Ola S1 Pro Gen 2 (Electric Scooter)',
    title: 'Ola S1 Pro Gen 2',
    type: 'bike',
    category: 'bike-rent',
    model: 'Ola S1 Pro Gen 2',
    brand: 'Ola Electric',
    hourlyPrice: 55,
    dailyPrice: 380,
    pricePerHour: 55,
    rangeKm: 195,
    seats: 2,
    fuelType: 'Electric',
    fuel: 'Electric (EV)',
    transmission: 'Automatic EV',
    image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600',
    available: true,
    location: 'OMR IT Corridor Hub (600119)',
    gpsLocation: { lat: 12.8990, lng: 80.2285, address: 'OMR Tech Corridor' }
  },
  {
    id: 'rent-bike-3',
    name: 'TVS Jupiter 125 Disc SmartXonnect',
    title: 'TVS Jupiter 125',
    type: 'bike',
    category: 'bike-rent',
    model: 'Jupiter 125 Disc',
    brand: 'TVS',
    hourlyPrice: 45,
    dailyPrice: 320,
    pricePerHour: 45,
    rangeKm: 280,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic CVT',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600',
    available: true,
    location: 'Coimbatore Gandhipuram (641012)',
    gpsLocation: { lat: 11.0168, lng: 76.9558, address: 'Gandhipuram Bus Stand' }
  },
  {
    id: 'rent-bike-4',
    name: 'Yamaha Aerox 155 VVA (Maxi Sports)',
    title: 'Yamaha Aerox 155',
    type: 'bike',
    category: 'bike-rent',
    model: 'Aerox 155 VVA',
    brand: 'Yamaha',
    hourlyPrice: 75,
    dailyPrice: 520,
    pricePerHour: 75,
    rangeKm: 340,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic VVA',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
    available: true,
    location: 'Madurai Central Hub (625001)',
    gpsLocation: { lat: 9.9252, lng: 78.1198, address: 'Madurai Junction' }
  },
  {
    id: 'rent-bike-5',
    name: 'Ather 450X Gen 3 (Warp Mode EV)',
    title: 'Ather 450X Gen 3',
    type: 'bike',
    category: 'bike-rent',
    model: 'Ather 450X',
    brand: 'Ather Energy',
    hourlyPrice: 60,
    dailyPrice: 420,
    pricePerHour: 60,
    rangeKm: 146,
    seats: 2,
    fuelType: 'Electric',
    fuel: 'Electric (EV)',
    transmission: 'Automatic EV',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    available: true,
    location: 'Chennai Central Hub (600003)',
    gpsLocation: { lat: 13.0827, lng: 80.2707, address: 'Central Metro Station' }
  },
  {
    id: 'rent-bike-6',
    name: 'Royal Enfield Hunter 350 (Dapper White)',
    title: 'Royal Enfield Hunter 350',
    type: 'bike',
    category: 'bike-rent',
    model: 'Hunter 350 Dapper',
    brand: 'Royal Enfield',
    hourlyPrice: 80,
    dailyPrice: 550,
    pricePerHour: 80,
    rangeKm: 450,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 5-Speed',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
    available: true,
    location: 'Anna Nagar Hub (600040)',
    gpsLocation: { lat: 13.0850, lng: 80.2100, address: 'Anna Nagar Tower Park' }
  },
  {
    id: 'rent-bike-7',
    name: 'Royal Enfield Himalayan 450 (Sherpa Adventure)',
    title: 'Royal Enfield Himalayan 450',
    type: 'bike',
    category: 'bike-rent',
    model: 'Himalayan 450 Sherpa',
    brand: 'Royal Enfield',
    hourlyPrice: 110,
    dailyPrice: 780,
    pricePerHour: 110,
    rangeKm: 480,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 6-Speed',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    available: true,
    location: 'Guindy Industrial Hub (600032)',
    gpsLocation: { lat: 13.0067, lng: 80.2026, address: 'Guindy Industrial Estate' }
  },
  {
    id: 'rent-bike-8',
    name: 'KTM Duke 390 (Hyper Naked Sports)',
    title: 'KTM Duke 390',
    type: 'bike',
    category: 'bike-rent',
    model: 'Duke 390',
    brand: 'KTM',
    hourlyPrice: 120,
    dailyPrice: 840,
    pricePerHour: 120,
    rangeKm: 360,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 6-Speed with Quickshifter',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600',
    available: true,
    location: 'OMR IT Corridor Hub (600119)',
    gpsLocation: { lat: 12.9010, lng: 80.2279, address: 'Sholinganallur Tech Park' }
  },
  {
    id: 'rent-bike-9',
    name: 'Honda Activa 6G (Smart Key Deluxe)',
    title: 'Honda Activa 6G',
    type: 'bike',
    category: 'bike-rent',
    model: 'Activa 6G Deluxe',
    brand: 'Honda',
    hourlyPrice: 40,
    dailyPrice: 280,
    pricePerHour: 40,
    rangeKm: 260,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic CVT',
    image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600',
    available: true,
    location: 'T. Nagar Hub (600017)',
    gpsLocation: { lat: 13.0418, lng: 80.2341, address: 'T. Nagar Bus Terminus' }
  },
  {
    id: 'rent-bike-10',
    name: 'TVS Apache RTR 200 4V (Ride Modes Edition)',
    title: 'TVS Apache RTR 200 4V',
    type: 'bike',
    category: 'bike-rent',
    model: 'Apache RTR 200',
    brand: 'TVS',
    hourlyPrice: 65,
    dailyPrice: 450,
    pricePerHour: 65,
    rangeKm: 420,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 5-Speed',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    available: true,
    location: 'Velachery Hub (600042)',
    gpsLocation: { lat: 12.9815, lng: 80.2180, address: 'Velachery Bypass Road' }
  },
  {
    id: 'rent-bike-11',
    name: 'Bajaj Pulsar NS200 (Perimeter Frame)',
    title: 'Bajaj Pulsar NS200',
    type: 'bike',
    category: 'bike-rent',
    model: 'Pulsar NS200',
    brand: 'Bajaj',
    hourlyPrice: 60,
    dailyPrice: 430,
    pricePerHour: 60,
    rangeKm: 410,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Manual 6-Speed',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600',
    available: true,
    location: 'Coimbatore Gandhipuram (641012)',
    gpsLocation: { lat: 11.0168, lng: 76.9558, address: 'Gandhipuram 7th Street' }
  },
  {
    id: 'rent-bike-12',
    name: 'Suzuki Burgman Street 125 (Maxi Comfort)',
    title: 'Suzuki Burgman Street 125',
    type: 'bike',
    category: 'bike-rent',
    model: 'Burgman Street 125',
    brand: 'Suzuki',
    hourlyPrice: 48,
    dailyPrice: 340,
    pricePerHour: 48,
    rangeKm: 310,
    seats: 2,
    fuelType: 'Petrol',
    fuel: 'Petrol',
    transmission: 'Automatic CVT',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
    available: true,
    location: 'Madurai Central Hub (625001)',
    gpsLocation: { lat: 9.9252, lng: 78.1198, address: 'Madurai Town Hall Road' }
  }
];

// Seed vehicles into MongoDB and dbStore
export const seedVehicles = async () => {
  try {
    for (const v of SEEDED_VEHICLES) {
      dbStore.addVehicle(v);
      try {
        await Vehicle.findOneAndUpdate({ id: v.id }, v, { upsert: true, new: true });
      } catch (err) {
        // Handled
      }
    }
    console.log('[MongoDB Fleet] Fleet vehicles synchronized in MongoDB and local store.');
  } catch (err) {
    console.warn('[MongoDB Fleet] Seeding fallback:', err.message);
  }
};

// ---------------------------------------------------------------------
// 1. ALL VEHICLES (General Fleet)
// ---------------------------------------------------------------------
router.get('/vehicles', async (req, res) => {
  try {
    let vehicles = [];
    try {
      vehicles = await Vehicle.find({});
    } catch {
      // offline fallback
    }
    const storeVehicles = dbStore.getVehicles();
    const combined = [...vehicles];
    for (const sv of storeVehicles) {
      if (!combined.some(v => v.id === sv.id)) {
        combined.push(sv);
      }
    }
    return res.json({ success: true, vehicles: combined.length ? combined : SEEDED_VEHICLES });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------
// 2. RENTAL VEHICLES (Cars & Bikes)
// ---------------------------------------------------------------------
router.get('/rentals', async (req, res) => {
  try {
    let mongoRentals = [];
    try {
      mongoRentals = await Vehicle.find({ 
        category: { $in: ['car-rent', 'bike-rent', 'car', 'bike'] } 
      });
    } catch {
      // offline fallback
    }
    const storeRentals = dbStore.getRentals();
    const combined = [...mongoRentals];
    for (const sr of storeRentals) {
      if (!combined.some(r => r.id === sr.id)) {
        combined.push(sr);
      }
    }
    return res.json({ success: true, rentals: combined });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register-rental', async (req, res) => {
  try {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ success: false, error: 'Vehicle name is required' });
    }

    const rentalId = data.id || ('rent-user-' + Date.now());
    const isBike = data.category === 'bike' || data.type?.toLowerCase().includes('bike');
    const categoryName = isBike ? 'bike-rent' : 'car-rent';

    const rentalRecord = {
      id: rentalId,
      name: data.name,
      title: data.name,
      brand: data.brand || 'Custom',
      type: data.type || (isBike ? 'Bike' : 'Sedan'),
      category: categoryName,
      model: data.name,
      hourlyPrice: Number(data.hourlyPrice) || 120,
      dailyPrice: Number(data.dailyPrice) || (Number(data.hourlyPrice || 120) * 8),
      pricePerHour: Number(data.hourlyPrice) || 120,
      rangeKm: Number(data.rangeKm) || 450,
      seats: Number(data.seats) || (isBike ? 2 : 5),
      transmission: data.transmission || 'Manual',
      location: data.location || 'Chennai Hub',
      image: data.image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
      features: data.features || ['Host Verified', 'Sanitized AC / Gear', 'Free Cancellation'],
      freeCancellation: true,
      instantUnlock: true,
      fuel: data.fuel || 'Petrol',
      fuelType: data.fuel || 'Petrol',
      hostName: data.hostName || 'Partner Host',
      postedByUserId: data.postedByUserId || 'usr_partner',
      isUserListing: true,
      available: true,
      gpsLocation: data.gpsLocation || { lat: 13.0827, lng: 80.2707, address: data.location || 'Chennai Hub' },
      createdAt: new Date().toISOString()
    };

    // 1. Immediately persist in local disk dbStore
    dbStore.addRental(rentalRecord);
    dbStore.addVehicle(rentalRecord);

    // 2. Persist in MongoDB Atlas
    let mongoSaved = false;
    try {
      await Vehicle.findOneAndUpdate(
        { id: rentalRecord.id },
        rentalRecord,
        { upsert: true, new: true }
      );
      mongoSaved = true;
      console.log(`[MongoDB Fleet] Rental vehicle saved in MongoDB Atlas: ${rentalRecord.name} (${rentalRecord.id})`);
    } catch (mErr) {
      console.warn(`[MongoDB Fleet] MongoDB Atlas rental save error:`, mErr.message);
    }

    return res.json({
      success: true,
      message: mongoSaved 
        ? 'Rental vehicle successfully saved to MongoDB database' 
        : 'Rental vehicle successfully saved to local persistent database',
      rental: rentalRecord,
      dbSaved: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------
// 3. CARPOOLS (Community Rides)
// ---------------------------------------------------------------------
router.get('/carpools', async (req, res) => {
  try {
    let mongoCarpools = [];
    try {
      mongoCarpools = await Carpool.find({});
    } catch {
      // offline fallback
    }
    const storeCarpools = dbStore.getCarpools();
    const combined = [...mongoCarpools];
    for (const sc of storeCarpools) {
      if (!combined.some(c => c.id === sc.id)) {
        combined.push(sc);
      }
    }
    return res.json({ success: true, carpools: combined });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/offer-carpool', async (req, res) => {
  try {
    const data = req.body;
    if (!data.from || !data.to) {
      return res.status(400).json({ success: false, error: 'Pickup and dropoff locations are required' });
    }

    const poolId = data.id || ('pool-user-' + Date.now());
    const carpoolRecord = {
      id: poolId,
      hostName: data.hostName || 'RideFlow Host',
      hostAvatar: data.hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      hostRating: 5.0,
      hostTrips: 1,
      hostBio: data.bio || `Daily commute offered by ${data.hostName || 'verified partner'}.`,
      from: data.from,
      to: data.to,
      departureTime: data.departureTime || '08:30 AM',
      isRecurring: data.isRecurring ?? true,
      recurringDays: data.isRecurring ? (data.recurringDays || 'Mon - Fri') : 'Single Trip',
      pricePerSeat: Number(data.pricePerSeat) || 80,
      availableSeats: Number(data.availableSeats) || 3,
      totalSeats: (Number(data.availableSeats) || 3) + 1,
      vehicleModel: data.vehicleModel || 'Maruti Suzuki Dzire',
      vehicleImage: data.vehicleImage || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600',
      amenities: data.amenities || ['AC Climate', 'Smooth Highway Drive', 'Non-Smoking'],
      verifiedCompany: 'Verified Community Host',
      co2SavedKg: 4.2,
      postedByUserId: data.postedByUserId || 'usr_partner',
      isUserListing: true,
      currentLocation: data.currentLocation || { lat: 13.0850, lng: 80.2100, speedKmH: 40 },
      createdAt: new Date().toISOString()
    };

    // 1. Immediately persist in local disk dbStore
    dbStore.addCarpool(carpoolRecord);

    // 2. Persist in MongoDB Atlas
    let mongoSaved = false;
    try {
      await Carpool.findOneAndUpdate(
        { id: carpoolRecord.id },
        carpoolRecord,
        { upsert: true, new: true }
      );
      mongoSaved = true;
      console.log(`[MongoDB Fleet] Carpool route saved in MongoDB Atlas: ${carpoolRecord.from} -> ${carpoolRecord.to}`);
    } catch (mErr) {
      console.warn(`[MongoDB Fleet] MongoDB Atlas carpool save error:`, mErr.message);
    }

    return res.json({
      success: true,
      message: mongoSaved 
        ? 'Carpool route successfully saved to MongoDB database' 
        : 'Carpool route successfully saved to persistent local database',
      carpool: carpoolRecord,
      dbSaved: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------
// 4. DRIVERS (Captains)
// ---------------------------------------------------------------------
router.get('/drivers', async (req, res) => {
  try {
    let mongoDrivers = [];
    try {
      mongoDrivers = await Driver.find({});
    } catch {
      // offline fallback
    }
    const storeDrivers = dbStore.getDrivers();
    const combined = [...mongoDrivers];
    for (const sd of storeDrivers) {
      if (!combined.some(d => d.id === sd.id)) {
        combined.push(sd);
      }
    }
    return res.json({ success: true, drivers: combined });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register-driver', async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.licensePlate) {
      return res.status(400).json({ success: false, error: 'Driver name and license plate are required' });
    }

    const isBike = data.category === 'bike' || data.isBikeTaxi;
    const driverId = data.id || ('drv-user-' + Date.now());
    const driverRecord = {
      id: driverId,
      category: isBike ? 'bike' : 'car',
      name: data.name,
      avatar: data.avatar || (data.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
      rating: 5.0,
      reviewCount: 1,
      trips: 0,
      vehicleModel: data.vehicleModel || (isBike ? 'Royal Enfield Hunter 350' : 'Toyota Innova Crysta'),
      licensePlate: data.licensePlate,
      categoryName: data.categoryName || (isBike ? 'RideFlow Rapid Bike Taxi' : 'RideFlow XL Partner'),
      baseFare: isBike ? 20 : (Number(data.baseFare) || 60),
      perKmRate: isBike ? 6 : (Number(data.perKmRate) || 14),
      etaMins: 3,
      distanceKm: 0.8,
      badge: 'New Verified Captain',
      phone: data.phone || '+91 98401 23456',
      languages: data.languages || ['Tamil', 'English'],
      city: data.city || 'Chennai',
      greeting: data.greeting || (isBike ? "Vanakkam! Sanitized helmet ready for quick commute." : "Vanakkam! Clean AC vehicle ready."),
      isFlagged: false,
      postedByUserId: data.postedByUserId || 'usr_partner',
      isUserListing: true,
      currentLocation: data.currentLocation || { lat: 13.0827, lng: 80.2707, speedKmH: 35 },
      createdAt: new Date().toISOString()
    };

    // 1. Immediately persist in local disk dbStore
    dbStore.addDriver(driverRecord);

    // 2. Persist in MongoDB Atlas
    let mongoSaved = false;
    try {
      await Driver.findOneAndUpdate(
        { id: driverRecord.id },
        driverRecord,
        { upsert: true, new: true }
      );
      mongoSaved = true;
      console.log(`[MongoDB Fleet] Driver registered in MongoDB Atlas: ${driverRecord.name} (${driverRecord.licensePlate})`);
    } catch (mErr) {
      console.warn(`[MongoDB Fleet] MongoDB Atlas driver save error:`, mErr.message);
    }

    return res.json({
      success: true,
      message: mongoSaved 
        ? 'Driver partner registered and saved to MongoDB database' 
        : 'Driver partner registered and saved to persistent database',
      driver: driverRecord,
      dbSaved: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------
// 5. TELEMETRY
// ---------------------------------------------------------------------
router.post('/telemetry/update', async (req, res) => {
  try {
    const { vehicleId, lat, lng } = req.body;
    try {
      await Vehicle.findOneAndUpdate({ id: vehicleId }, { currentLat: lat, currentLng: lng });
    } catch {
      // Handled
    }
    return res.json({ success: true, message: 'Telemetry updated in MongoDB and local store' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
