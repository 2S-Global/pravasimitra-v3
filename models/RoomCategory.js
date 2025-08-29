import mongoose from "mongoose";

const RoomCategorySchema = new mongoose.Schema(
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
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.RoomCategory ||
  mongoose.model("RoomCategory", RoomCategorySchema);
