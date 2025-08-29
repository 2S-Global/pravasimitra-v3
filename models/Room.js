import { type } from "jquery";
import mongoose from "mongoose";

const RentItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    images: {
      type: [String],
    },
    icon: {
      type: String,
    },
    propertyType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomCategory",
    },
    roomSize: {
      type: String,
    },
    bedrooms: {
      type: Number,
    },
    bathrooms: {
      type: Number,
    },
    furnished: {
      type: String,
      enum: ["Yes", "No"],
    },
    price: {
      type: Number,
    },
    currency: {
      type: mongoose.Schema.Types.String,
      ref: "Country",
      required: true,
    },
    frequency: {
      type: String,
    },
    shortDesc: {
      type: String,
    },
    description: {
      type: String,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    // state: {
    //   type: String,
    // },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    location: {
      type: String,
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.models.RoomItem ||
  mongoose.model("RoomItem", RentItemSchema);
