import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import { withAuth } from "../../../../../lib/withAuth";
import RoomCategory from "../../../../../models/RoomCategory";
import User from "../../../../../models/User";
import Amenity from "../../../../../models/Amenity";
import City from "../../../../../models/City";
import Country from "../../../../../models/Country";
import { decodeObjectId, encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Get a single RoomItem by its encoded ID
 * @route GET /api/rent-lease/details
 * @queryparam {string} id - Encoded RoomItem ID
 * @success {object} 200 - Returns the RoomItem data with encoded ID
 * @error {object} 400 - Missing or invalid ID in query
 * @error {object} 404 - Item not found
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const encodedId = searchParams.get("id");

  if (!encodedId) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Missing RoomItem ID in query" },
        { status: 400 }
      )
    );
  }

  try {
    const decodedId = decodeObjectId(encodedId); // 👈 decode the RoomItem MongoDB _id

    const item = await RoomItem.findOne({ _id: decodedId, isDel: false })
      .select("-__v -isDel")
      .populate("propertyType", "name")
      .populate("amenities", "name")
      .populate("createdBy", "name email mobile")
      .populate("city", "name")
      .populate("country", "name")
      .lean();

    if (!item) {
      return addCorsHeaders(
        NextResponse.json({ msg: "Item not found" }, { status: 404 })
      );
    }

    // item.images = item.images.map(filename => {
    //   return `${process.env.IMAGE_URL}/rent-items/${filename}`;
    // });

    // ✅ Use Cloudinary URLs directly without modifying
    item.images = Array.isArray(item.images)
      ? item.images.map((img) => img)
      : [];

    const updatedItem = {
      ...item,
      id: encodeObjectId(item._id), // 👈 encode it back for frontend
    };
    delete updatedItem._id;

    return addCorsHeaders(
      NextResponse.json({ item: updatedItem }, { status: 200 })
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid RoomItem ID" }, { status: 400 })
    );
  }
};
