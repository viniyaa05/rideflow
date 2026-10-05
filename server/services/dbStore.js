import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STORE = {
  users: [
    {
      id: 'usr_alex_chen',
      name: 'Alex Chen',
      phone: '+91 98401 23456',
      email: 'alex.chen@gmail.com',
      password: 'alex123',
      role: 'driver',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: 4.95,
      tripsCount: 142,
      walletBalance: 1250,
      strikes: 0,
      isSuspended: false
    },
    {
      id: 'usr_pooja_sundaram',
      name: 'Pooja Sundaram',
      phone: '+91 98409 11223',
      email: 'pooja.sundaram@gmail.com',
      password: 'pooja123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      rating: 4.88,
      tripsCount: 38,
      walletBalance: 420,
      strikes: 0,
      isSuspended: false
    },
    {
      id: 'usr_karthik_raja',
      name: 'Karthik Raja',
      phone: '+91 97890 55443',
      email: 'karthik.raja@yahoo.com',
      password: 'karthik123',
      role: 'driver',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      rating: 4.92,
      tripsCount: 210,
      walletBalance: 2400,
      strikes: 0,
      isSuspended: false
    },
    {
      id: 'usr_ananya_sharma',
      name: 'Ananya Sharma',
      phone: '+91 98840 99887',
      email: 'ananya.sharma@outlook.com',
      password: 'ananya123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: 4.79,
      tripsCount: 19,
      walletBalance: 180,
      strikes: 0,
      isSuspended: false
    },
    {
      id: 'usr_rajesh_kumar',
      name: 'Rajesh Kumar',
      phone: '+91 94440 12345',
      email: 'rajesh.kumar@gmail.com',
      password: 'rajesh123',
      role: 'driver',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.65,
      tripsCount: 88,
      walletBalance: 320,
      strikes: 2,
      isSuspended: false
    },
    {
      id: 'usr_admin_tn',
      name: 'Tamil Nadu Admin',
      phone: '+91 99999 00000',
      email: 'admin@rideflow.tn.gov.in',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 5.0,
      tripsCount: 0,
      walletBalance: 99999,
      strikes: 0,
      isSuspended: false
    }
  ],
  rentals: [],
  carpools: [],
  drivers: [],
  vehicles: [],
  bookings: []
};

class DBStore {
  constructor() {
    this.data = this.readData();
  }

  readData() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || DEFAULT_STORE.users,
          rentals: parsed.rentals || [],
          carpools: parsed.carpools || [],
          drivers: parsed.drivers || [],
          vehicles: parsed.vehicles || [],
          bookings: parsed.bookings || []
        };
      }
    } catch (err) {
      console.warn('[DBStore] Error reading store.json, reinitializing:', err.message);
    }
    this.saveData(DEFAULT_STORE);
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }

  saveData(data) {
    try {
      const tempPath = STORE_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(data || this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, STORE_FILE);
    } catch (err) {
      console.error('[DBStore] Error writing store.json:', err.message);
    }
  }

  // --- Users ---
  getUsers() {
    return this.data.users;
  }

  findUser(predicate) {
    return this.data.users.find(predicate);
  }

  addUser(user) {
    const existingIndex = this.data.users.findIndex(
      (u) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email?.toLowerCase()) || (u.phone && u.phone === user.phone)
    );
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...user };
    } else {
      this.data.users.unshift(user);
    }
    this.saveData();
    return user;
  }

  updateUserPassword(identifier, newPassword) {
    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/[^0-9]/g, '');
    const user = this.data.users.find((u) =>
      u.email.toLowerCase() === clean ||
      u.phone === clean ||
      (digits.length >= 10 && u.phone.replace(/[^0-9]/g, '').includes(digits.slice(-10)))
    );
    if (user) {
      user.password = newPassword;
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Rentals ---
  getRentals() {
    return this.data.rentals;
  }

  addRental(rental) {
    const existingIndex = this.data.rentals.findIndex((r) => r.id === rental.id);
    if (existingIndex >= 0) {
      this.data.rentals[existingIndex] = { ...this.data.rentals[existingIndex], ...rental };
    } else {
      this.data.rentals.unshift(rental);
    }
    this.saveData();
    return rental;
  }

  // --- Carpools ---
  getCarpools() {
    return this.data.carpools;
  }

  addCarpool(carpool) {
    const existingIndex = this.data.carpools.findIndex((c) => c.id === carpool.id);
    if (existingIndex >= 0) {
      this.data.carpools[existingIndex] = { ...this.data.carpools[existingIndex], ...carpool };
    } else {
      this.data.carpools.unshift(carpool);
    }
    this.saveData();
    return carpool;
  }

  // --- Drivers ---
  getDrivers() {
    return this.data.drivers;
  }

  addDriver(driver) {
    const existingIndex = this.data.drivers.findIndex((d) => d.id === driver.id);
    if (existingIndex >= 0) {
      this.data.drivers[existingIndex] = { ...this.data.drivers[existingIndex], ...driver };
    } else {
      this.data.drivers.unshift(driver);
    }
    this.saveData();
    return driver;
  }

  // --- Vehicles (General fleet) ---
  getVehicles() {
    return this.data.vehicles;
  }

  addVehicle(vehicle) {
    const existingIndex = this.data.vehicles.findIndex((v) => v.id === vehicle.id);
    if (existingIndex >= 0) {
      this.data.vehicles[existingIndex] = { ...this.data.vehicles[existingIndex], ...vehicle };
    } else {
      this.data.vehicles.unshift(vehicle);
    }
    this.saveData();
    return vehicle;
  }

  // --- Bookings ---
  getBookings() {
    return this.data.bookings;
  }

  addBooking(booking) {
    this.data.bookings.unshift(booking);
    this.saveData();
    return booking;
  }

  // --- Password Reset OTPs ---
  setResetOTP(identifier, record) {
    if (!this.data.resets) this.data.resets = {};
    this.data.resets[identifier.toLowerCase().trim()] = record;
    this.saveData();
  }

  getResetOTP(identifier) {
    if (!this.data.resets) this.data.resets = {};
    return this.data.resets[identifier.toLowerCase().trim()];
  }

  deleteResetOTP(identifier) {
    if (!this.data.resets) return;
    delete this.data.resets[identifier.toLowerCase().trim()];
    this.saveData();
  }
}

export const dbStore = new DBStore();
