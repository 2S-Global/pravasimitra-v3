import mongoose from "mongoose";
import { ref } from "process";

const MarketProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    images: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketCategory",
    },
    location: {
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
    // ingredients: {
    //   type: String,
    // },
    price: {
      type: Number,
    },
    currency: {
      type: mongoose.Schema.Types.String,
      ref: "Country",
      required: true,
    },
    // shortDesc: {
    //   type: String,
    // },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    unit: {
      type: String,
    },
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

export default mongoose.models.MarketProduct ||
  mongoose.model("MarketProduct", MarketProductSchema);
