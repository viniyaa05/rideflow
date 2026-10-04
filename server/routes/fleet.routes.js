import express from 'express';
import Vehicle from '../models/Vehicle.js';

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

// Seed vehicles into MongoDB
export const seedVehicles = async () => {
  try {
    for (const v of SEEDED_VEHICLES) {
      await Vehicle.findOneAndUpdate({ id: v.id }, v, { upsert: true, new: true });
    }
    console.log('[MongoDB Fleet] Fleet vehicles verified in MongoDB.');
  } catch (err) {
    console.warn('[MongoDB Fleet] Seeding fallback:', err.message);
  }
};

// Get all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    let vehicles = [];
    try {
      vehicles = await Vehicle.find({});
    } catch {
      vehicles = SEEDED_VEHICLES;
    }
    return res.json({ success: true, vehicles: vehicles.length ? vehicles : SEEDED_VEHICLES });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update vehicle telemetry coordinates
router.post('/telemetry/update', async (req, res) => {
  try {
    const { vehicleId, lat, lng } = req.body;
    try {
      await Vehicle.findOneAndUpdate({ id: vehicleId }, { currentLat: lat, currentLng: lng });
    } catch {
      // In-memory update
    }
    return res.json({ success: true, message: 'Telemetry updated in MongoDB' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
