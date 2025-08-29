import mongoose from "mongoose";

const roomContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomItem",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.RoomContact ||
  mongoose.model("RoomContact", roomContactSchema);
