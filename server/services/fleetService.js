import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import { dbStore } from './dbStore.js';

export const fleetService = {
  /**
   * Helper to normalize vehicle properties so frontend never encounters undefined name or hourlyPrice
   */
  normalizeVehicle(v) {
    const raw = v.toObject ? v.toObject() : { ...v };
    const displayName = raw.name || raw.title || raw.model || 'Standard Vehicle';
    const hourly = Number(raw.hourlyPrice ?? raw.pricePerHour ?? 180);
    const daily = Number(raw.dailyPrice ?? (hourly * 8));

    return {
      ...raw,
      id: raw.id || 'veh_' + Math.random().toString(36).substr(2, 8),
      title: displayName,
      name: displayName,
      hourlyPrice: hourly,
      pricePerHour: hourly,
      dailyPrice: daily,
      type: raw.type || (raw.category?.includes('bike') ? 'Bike' : 'Sedan'),
      category: raw.category || 'car-rent',
      seats: Number(raw.seats || 4),
      rangeKm: Number(raw.rangeKm || 450),
      transmission: raw.transmission || 'Manual',
      location: raw.location || 'Chennai Central Hub',
      available: raw.available !== false
    };
  },

  /**
   * Fetch all vehicles
   */
  async getVehicles(category) {
    let list = [];
    try {
      const query = category ? { category } : {};
      list = await Vehicle.find(query);
    } catch {}

    if (!list || list.length === 0) {
      list = dbStore.getVehicles();
      if (category) {
        list = list.filter((v) => v.category === category);
      }
    }

    return list.map(this.normalizeVehicle);
  },

  /**
   * Fetch rental fleet
   */
  async getRentals() {
    let list = [];
    try {
      list = await Vehicle.find({ category: { $in: ['car-rent', 'bike-rent', 'car', 'bike'] } });
    } catch {}

    if (!list || list.length === 0) {
      list = dbStore.getRentals();
    }

    return list.map(this.normalizeVehicle);
  },

  /**
   * Register a new rental vehicle
   */
  async registerRental(carData) {
    const carId = carData.id || 'rent_' + Date.now();
    const normalized = this.normalizeVehicle({ ...carData, id: carId });

    let saved = normalized;
    try {
      saved = await Vehicle.findOneAndUpdate(
        { id: carId },
        { $set: normalized },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.warn('[FleetService] Rental save warning:', err.message);
    }

    dbStore.addRental(normalized);
    return this.normalizeVehicle(saved);
  },

  /**
   * Register a driver partner
   */
  async registerDriver(driverData) {
    const driverId = driverData.id || 'drv_' + Date.now();
    const doc = {
      ...driverData,
      id: driverId,
      status: 'active',
      rating: 5.0,
      totalTrips: 0,
      createdAt: new Date()
    };

    let saved = doc;
    try {
      saved = await Driver.findOneAndUpdate(
        { id: driverId },
        { $set: doc },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.warn('[FleetService] Driver save warning:', err.message);
    }

    dbStore.addDriver(doc);
    return saved;
  },

  /**
   * Fetch driver partners
   */
  async getDrivers() {
    let list = [];
    try {
      list = await Driver.find({});
    } catch {}

    if (!list || list.length === 0) {
      list = dbStore.getDrivers();
    }

    return list;
  }
};
