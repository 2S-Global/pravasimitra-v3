import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MarketProduct",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
  },
  // currency: {
  //   type: mongoose.Schema.Types.String,
  //   ref: "Country",
  //   required: true,
  // },
  currency: {
    type: String,
  },
  currencyName: {
    type: String,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [cartItemSchema],
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
