import mongoose from 'mongoose';

const MarketCategorySchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    isDel: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.MarketCategory || mongoose.model("MarketCategory", MarketCategorySchema);
