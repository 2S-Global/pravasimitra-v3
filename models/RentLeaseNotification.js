import mongoose from "mongoose";

const RentLeaseNotificationSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomItem",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.RentLeaseNotification ||
  mongoose.model("RentLeaseNotification", RentLeaseNotificationSchema);
