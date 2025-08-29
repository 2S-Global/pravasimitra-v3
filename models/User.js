import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    fatherName: {
      type: String,
    },
    motherName: {
      type: String,
    },
    spouseName: {
      type: String,
    },
    password: { type: String, select: false },
    email: { type: String },
    phone: { type: String },
    dateOfBirth: {
      type: Date,
    },
    mobile: { type: String },
    gender: {
      type: String,
    },
    address: {
      type: String,
    },
    passportNumber: {
      type: String,
    },
    passportExpiry: {
      type: Date,
    },
    visaNumber: {
      type: String,
    },
    visaExpiry: {
      type: Date,
    },
    bmetNumber: {
      type: String,
    },
    braId: {
      type: String,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
    },

    isDel: { type: Boolean, default: false },
  },

  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
