import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, default: 'usr_guest' },
  userName: { type: String, default: 'RideFlow Commuter' },
  userPhone: { type: String, default: '+91 98401 00000' },
  mode: { type: String },
  serviceType: { type: String },
  title: { type: String },
  pickupLocation: { type: String, default: 'Chennai Central' },
  dropoffLocation: { type: String, default: 'OMR IT Expressway' },
  pickupCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  dropoffCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  fare: { type: Number, default: 0 },
  finalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  otp: { type: String, default: () => Math.floor(1000 + Math.random() * 9000).toString() },
  otpVerified: { type: Boolean, default: false },
  status: { type: String, default: 'Confirmed' },
  paymentMethod: { type: String, default: 'wallet' },
  paymentMethodName: { type: String, default: 'RideFlow Wallet' },
  driverOrHost: { type: String, default: 'RideFlow Verified Driver / Host' },
  driver: {
    id: { type: String },
    name: { type: String },
    phone: { type: String },
    rating: { type: Number },
    avatar: { type: String },
    vehicleModel: { type: String },
    vehicleNumber: { type: String },
    vehicleImage: { type: String },
    currentLat: { type: Number },
    currentLng: { type: Number }
  },
  seats: { type: Number, default: 1 },
  rentalHours: { type: Number },
  scheduledTime: { type: String, default: 'Scheduled for Today' },
  pickupEta: { type: String, default: 'Pickup in ~12 mins' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

