import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  targetUserId: { type: String, required: true },
  targetUserName: { type: String, required: true },
  targetUserRole: { type: String, default: 'user' },
  reportedBy: { type: String, required: true },
  reason: { type: String, required: true },
  details: { type: String },
  category: { 
    type: String, 
    enum: ['harassment', 'fake_booking', 'dangerous_driving', 'unauthorized_vehicle', 'payment_fraud', 'other'], 
    default: 'other' 
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  strikeNumber: { type: Number, required: true },
  actionTaken: { type: String, enum: ['warning', 'strike_issued', 'auto_suspended', 'banned'], default: 'strike_issued' },
  status: { type: String, enum: ['active', 'under_appeal', 'revoked', 'resolved'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
