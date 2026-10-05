import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  name: { type: String },
  brand: { type: String },
  type: { type: String, required: true },
  category: { type: String, required: true }, // 'bike-taxi', 'drivers', 'carpool', 'bike-rent', 'car-rent', 'car', 'bike'
  model: { type: String },
  hourlyPrice: { type: Number },
  dailyPrice: { type: Number },
  pricePerHour: { type: Number },
  pricePerKm: { type: Number },
  seats: { type: Number, default: 1 },
  rangeKm: { type: Number, default: 500 },
  transmission: { type: String, default: 'Manual' },
  fuelType: { type: String, default: 'Petrol' },
  fuel: { type: String, default: 'Petrol' },
  image: { type: String },
  features: { type: [String], default: [] },
  freeCancellation: { type: Boolean, default: true },
  instantUnlock: { type: Boolean, default: true },
  hostName: { type: String, default: 'RideFlow Partner' },
  postedByUserId: { type: String, default: 'system' },
  isUserListing: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  location: { type: String, default: 'Chennai Central' },
  gpsLocation: {
    lat: { type: Number, default: 13.0827 },
    lng: { type: Number, default: 80.2707 },
    address: { type: String, default: 'Chennai Hub' }
  },
  currentLat: { type: Number },
  currentLng: { type: Number }
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
