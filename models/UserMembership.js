import mongoose from "mongoose";

const userMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
    },
    usage: {
      buySell: { type: Number, default: 0 },
      rentLease: { type: Number, default: 0 },
      marketplace: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.UserMembership ||
  mongoose.model("UserMembership", userMembershipSchema);
