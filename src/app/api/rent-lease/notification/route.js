import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RentLeaseNotification from "../../../../../models/RentLeaseNotification";
import RoomItem from "../../../../../models/Room";
import User from "../../../../../models/User";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// Get all notifications sent to the logged-in user
export const GET = withAuth(async (req, user) => {
  await connectDB();

  const baseImageUrl = process.env.IMAGE_URL + "/rent-items";

  const notifications = await RentLeaseNotification.find({ toUser: user.id })
    .populate("fromUser", "name email")
    .populate("toUser", "name email")
    .populate("roomId", "title images")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = notifications.map((notif) => ({
    _id: notif._id,
    fromUser: notif.fromUser,
    toUser: notif.toUser?.name || null,
    roomId: notif.roomId
      ? {
          _id: notif.roomId._id,
          title: notif.roomId.title,
          images: notif.roomId.images?.map((img) => `${baseImageUrl}/${img}`),
        }
      : null,
    isRead: notif.isRead,
    createdAt: notif.createdAt,
  }));

  return addCorsHeaders(
    NextResponse.json(
      { success: true, notifications: formatted },
      { status: 200 }
    )
  );
});

// Create a new notification
export const POST = withAuth(async (req, user) => {
  await connectDB();

  const { to, roomId } = await req.json();

  const notification = new RentLeaseNotification({
    fromUser: user.id,
    toUser: to,
    roomId,
  });

  await notification.save();

  return addCorsHeaders(
    NextResponse.json({ success: true, message: "Notification sent." })
  );
});

// PATCH: Mark a notification as read
export const PATCH = withAuth(async (req, user) => {
  await connectDB();

  const { notificationId } = await req.json();

  const result = await RentLeaseNotification.updateOne(
    { _id: notificationId, toUser: user.id },
    { $set: { isRead: true } }
  );

  if (result.modifiedCount === 0) {
    return addCorsHeaders(
      NextResponse.json(
        { success: false, message: "Notification not found or already read." },
        { status: 404 }
      )
    );
  }

  return addCorsHeaders(
    NextResponse.json({
      success: true,
      message: "Notification marked as read.",
    })
  );
});
