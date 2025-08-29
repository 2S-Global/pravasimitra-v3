import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import BuySellNotification from "../../../../../models/BuySellNotification";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// Get all notifications sent to the logged-in user
export const GET = withAuth(async (req, user) => {
  await connectDB();

  const baseImageUrl = process.env.IMAGE_URL + "/product-items";

  const notifications = await BuySellNotification.find({ toUser: user.id })
    .populate("fromUser", "name email")
    .populate("toUser", "name email")
    .populate("productId", "title image")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = notifications.map((notif) => ({
    _id: notif._id,
    fromUser: notif.fromUser,
    toUser: notif.toUser?.name || null,
    productId: notif.productId
      ? {
          _id: notif.productId._id,
          title: notif.productId.title,
          image: Array.isArray(notif.productId.image)
          ? notif.productId.image.map((img) => `${baseImageUrl}/${img}`)
          : notif.productId.image
          ? [`${baseImageUrl}/${notif.productId.image}`]
          : [],
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

  const { to, productId } = await req.json();

  const notification = new BuySellNotification({
    fromUser: user.id,
    toUser: to,
    productId,
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

  const result = await BuySellNotification.updateOne(
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
