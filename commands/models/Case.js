import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  action: { type: String, enum: ['Ban', 'Unban', 'Warn', 'Timeout'], required: true },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now },
  appeal: { type: String } // optional field for appeal text
});

export default mongoose.model('Case', caseSchema);

