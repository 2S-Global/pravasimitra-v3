import mongoose from "mongoose";

const LocationSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    currentCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    destinationCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    destinationCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.LocationSetting ||
  mongoose.model("LocationSetting", LocationSettingSchema, "location_settings");
