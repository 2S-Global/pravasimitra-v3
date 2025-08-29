import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RoomContact from "../../../../../models/RoomContact";
import User from "../../../../../models/User";
import RoomItem from "../../../../../models/Room";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const encodedRoomId = searchParams.get("id");

  if (!encodedRoomId) {
    return addCorsHeaders(NextResponse.json({ error: "Missing room ID" }, { status: 400 }));
  }

  let roomId;
  try {
    roomId = decodeObjectId(encodedRoomId);
  } catch {
    return addCorsHeaders(NextResponse.json({ error: "Invalid room ID" }, { status: 400 }));
  }

  try {
    const contacts = await RoomContact.find({ roomId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email image")
      .lean();

    const response = contacts.map((entry) => ({
      name: entry.userId?.name,
      email: entry.userId?.email,
      image: entry.userId?.image || "/assets/images/default-user.png",
      contactedAt: entry.createdAt,
    }));

    return addCorsHeaders(NextResponse.json({ users: response }, { status: 200 }));
  } catch (err) {
    console.error("Contact fetch failed:", err);
    return addCorsHeaders(NextResponse.json({ error: "Failed to fetch contact list" }, { status: 500 }));
  }
};
