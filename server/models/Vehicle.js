import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['bike', 'car', 'scooter'], required: true },
  category: { type: String, enum: ['bike-taxi', 'drivers', 'carpool', 'bike-rent', 'car-rent'], required: true },
  model: { type: String, required: true },
  pricePerHour: { type: Number },
  pricePerKm: { type: Number },
  seats: { type: Number, default: 1 },
  fuelType: { type: String, default: 'Petrol' },
  image: { type: String },
  available: { type: Boolean, default: true },
  location: { type: String, default: 'Chennai Central' },
  currentLat: { type: Number },
  currentLng: { type: Number }
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
