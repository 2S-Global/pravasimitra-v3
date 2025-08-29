import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RoomContact from "../../../../../models/RoomContact";
import RoomItem from "../../../../../models/Room";
import User from "../../../../../models/User";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
  await connectDB();

  try {
    const contacts = await RoomContact.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .populate("roomId", "title images")
      .populate({
        path: "ownerId",
        select: "name email phone",
      })
      .lean();

    // const result = contacts.map((contact) => ({
    //   roomTitle: contact.roomId?.title,
    //   roomImage: contact.roomId?.image,
    //   ownerName: contact.ownerId?.name,
    //   ownerEmail: contact.ownerId?.email,
    //   ownerPhone: contact.ownerId?.phone || "N/A",
    //   contactedAt: contact.createdAt,
    // }));

    const baseImageUrl = process.env.IMAGE_URL;

    const result = contacts.map((contact) => ({
      id: contact.roomId?._id,
      roomTitle: contact.roomId?.title,
      roomImages:
        Array.isArray(contact.roomId?.images) &&
        contact.roomId.images.length > 0
          ? contact.roomId.images[0]
          : [`${baseImageUrl}noimage.jpg`],

      ownerName: contact.ownerId?.name,
      ownerEmail: contact.ownerId?.email,
      ownerPhone: contact.ownerId?.phone,
      contactedAt: contact.createdAt,
    }));

    return addCorsHeaders(NextResponse.json({ list: result }, { status: 200 }));
  } catch (err) {
    console.error("Fetching contacted owners failed:", err);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to fetch contacted owners" },
        { status: 500 }
      )
    );
  }
});
