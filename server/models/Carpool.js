import mongoose from 'mongoose';

const CarpoolSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  hostName: { type: String, required: true },
  hostAvatar: { type: String },
  hostRating: { type: Number, default: 5.0 },
  hostTrips: { type: Number, default: 1 },
  hostBio: { type: String },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, default: '08:30 AM' },
  isRecurring: { type: Boolean, default: true },
  recurringDays: { type: String, default: 'Mon - Fri' },
  pricePerSeat: { type: Number, required: true },
  availableSeats: { type: Number, default: 3 },
  totalSeats: { type: Number, default: 4 },
  vehicleModel: { type: String, default: 'Maruti Suzuki Dzire' },
  vehicleImage: { type: String },
  amenities: { type: [String], default: ['AC Climate', 'Smooth Ride'] },
  verifiedCompany: { type: String, default: 'Verified Community Host' },
  co2SavedKg: { type: Number, default: 4.2 },
  postedByUserId: { type: String, default: 'usr_guest' },
  isUserListing: { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number, default: 13.0850 },
    lng: { type: Number, default: 80.2100 },
    speedKmH: { type: Number, default: 40 }
  }
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.Carpool || mongoose.model('Carpool', CarpoolSchema);
