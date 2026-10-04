import mongoose from 'mongoose';

const AppealSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String },
  userPhone: { type: String },
  reason: { type: String, required: true },
  evidenceText: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String },
  reviewedBy: { type: String },
  submittedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

export default mongoose.models.Appeal || mongoose.model('Appeal', AppealSchema);
