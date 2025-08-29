import mongoose from 'mongoose';

const priceRangeSchema = new mongoose.Schema(
  {
    label1: {
      type: String,
    },
    label2: {
      type: String,
    },
    value: {
      type: String, // Storing like "0-500", "500-1000", etc.
    },
  },
  { timestamps: true }
);

export default mongoose.models.PriceRange ||
  mongoose.model('PriceRange', priceRangeSchema);
