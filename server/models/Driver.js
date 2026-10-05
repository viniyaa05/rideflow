import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['bike', 'car'], default: 'car' },
  avatar: { type: String },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 1 },
  trips: { type: Number, default: 0 },
  vehicleModel: { type: String, required: true },
  licensePlate: { type: String, required: true },
  categoryName: { type: String },
  baseFare: { type: Number, default: 40 },
  perKmRate: { type: Number, default: 12 },
  etaMins: { type: Number, default: 4 },
  distanceKm: { type: Number, default: 1.0 },
  badge: { type: String, default: 'Verified Captain' },
  phone: { type: String, default: '+91 98401 23456' },
  languages: { type: [String], default: ['Tamil', 'English'] },
  city: { type: String, default: 'Chennai' },
  greeting: { type: String, default: 'Vanakkam! Clean ride ready.' },
  isFlagged: { type: Boolean, default: false },
  postedByUserId: { type: String, default: 'usr_guest' },
  isUserListing: { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number, default: 13.0827 },
    lng: { type: Number, default: 80.2707 },
    speedKmH: { type: Number, default: 35 }
  }
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.Driver || mongoose.model('Driver', DriverSchema);
