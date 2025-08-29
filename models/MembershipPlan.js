import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },
    currency: {
      type: String,
    },
    currencyName: {
      type: String,
    },
    limits: {
      buySell: { type: Number, default: 0 },
      rentLease: { type: Number, default: 0 },
      marketplace: { type: Number, default: 0 }
    },
    durationInDays: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // }
  },
  { timestamps: true }
);

export default mongoose.models.MembershipPlan ||
  mongoose.model("MembershipPlan", membershipPlanSchema);
