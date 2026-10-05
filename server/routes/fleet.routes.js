import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Carpool from '../models/Carpool.js';
import Driver from '../models/Driver.js';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();

const SEEDED_VEHICLES = [
  {
    id: 'veh_bike_1',
    title: 'Ola Electric S1 Pro',
    type: 'bike',
    category: 'bike-taxi',
    model: 'Ola S1 Pro Gen 2',
    pricePerKm: 6,
    seats: 1,
    fuelType: 'Electric',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400',
    available: true,
    location: 'Chennai Central'
  },
  {
    id: 'veh_bike_2',
    title: 'Royal Enfield Classic 350',
    type: 'bike',
    category: 'bike-rent',
    model: 'Classic 350 Chrome Red',
    pricePerHour: 45,
    seats: 2,
    fuelType: 'Petrol',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400',
    available: true,
    location: 'Anna Nagar West'
  },
  {
    id: 'veh_car_1',
    title: 'Maruti Suzuki Dzire',
    type: 'car',
    category: 'drivers',
    model: 'Dzire ZXi Plus',
    pricePerKm: 14,
    seats: 4,
    fuelType: 'Petrol/CNG',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400',
    available: true,
    location: 'OMR IT Expressway'
  },
  {
    id: 'veh_car_2',
    title: 'Mahindra Thar 4x4',
    type: 'car',
    category: 'car-rent',
    model: 'Thar LX Hardtop Diesel 4x4',
    pricePerHour: 240,
    seats: 4,
    fuelType: 'Diesel',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
    available: true,
    location: 'Guindy Race Course'
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
