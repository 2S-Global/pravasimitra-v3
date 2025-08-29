import mongoose from "mongoose";

const MembershipTransactionSchema = new mongoose.Schema(
  {
    stripeSessionId: { type: String,  unique: true },
    paymentIntentId: { type: String,  },
    customerEmail: { type: String },
    amountTotal: { type: Number,  },
    currency: { type: String,  },
    paymentStatus: { type: String, },
    rawSession: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.MembershipTransaction ||
  mongoose.model("MembershipTransaction", MembershipTransactionSchema);
