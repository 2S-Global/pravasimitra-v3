import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  stripeSessionId: { type: String, required: true, unique: true },
  paymentIntentId: { type: String },
  customerEmail: { type: String },
  amountTotal: { type: Number },
  currency: { type: String },
  paymentStatus: { type: String },
  rawSession: { type: Object }, // optional full session details for audit/debug
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
