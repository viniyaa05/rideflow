import mongoose from 'mongoose';

const SupportQuerySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  adminReply: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SupportQuery || mongoose.model('SupportQuery', SupportQuerySchema);
