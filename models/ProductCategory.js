import mongoose from "mongoose";

const ProductCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    icon: {
      type: String,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", ProductCategorySchema);
