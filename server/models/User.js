import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
  avatar: { type: String },
  rating: { type: Number, default: 4.8 },
  tripsCount: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 500 },
  strikes: { type: Number, default: 0 },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String, default: null },
  appealStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  vehicleDetails: {
    model: { type: String },
    regNumber: { type: String },
    type: { type: String },
    image: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
