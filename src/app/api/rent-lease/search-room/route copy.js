import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import RoomCategory from "../../../../../models/RoomCategory";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { encodeObjectId, decodeObjectId } from "../../../../../lib/idCodec";
export async function OPTIONS() {
  return optionsResponse();
}

export const GET =withAuth(async function (req,user) {
  await connectDB();
      const userId = user?.id;
  const { searchParams } = new URL(req.url);

  const location = searchParams.get("location");
  const priceRange = searchParams.get("priceRange"); // format: "0-500"
  const bedrooms = searchParams.get("bedrooms");
  const categoryEncoded = searchParams.get("categoryId");

  const baseImageUrl = process.env.IMAGE_URL;

  const query = {
    isDel: false,
  };

  // Location (case-insensitive partial match)
  if (location) {
    const regex = new RegExp(location, "i"); // case-insensitive regex

    query.$or = [
      { location: { $regex: regex } },
    ];
  }

  // Price range
  if (priceRange) {
    if (priceRange.includes("+")) {
      // Handle "1000+"
      const min = Number(priceRange.replace("+", ""));
      if (!isNaN(min)) {
        query.price = { $gte: min };
      }
    } else {
      const [minStr, maxStr] = priceRange.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);

      if (!isNaN(min) && !isNaN(max)) {
        query.price = { $gte: min, $lte: max };
      } else if (!isNaN(min)) {
        query.price = { $gte: min };
      } else if (!isNaN(max)) {
        query.price = { $lte: max };
      }
    }
  }

  // Bedrooms
  if (bedrooms) {
    if (bedrooms.includes("+")) {
      const minBedrooms = Number(bedrooms.replace("+", ""));
      if (!isNaN(minBedrooms)) {
        query.bedrooms = { $gte: minBedrooms };
      }
    } else {
      const exactBedrooms = Number(bedrooms);
      if (!isNaN(exactBedrooms)) {
        query.bedrooms = exactBedrooms;
      }
    }
  }

  // Category (propertyType)
  if (categoryEncoded) {
    const category = decodeObjectId(categoryEncoded);
    query.propertyType = category;
  }

  try {
    const rooms = await RoomItem.find(query).populate("propertyType");

    const formattedRooms = rooms.map((room) => ({
      ...room.toObject(),
      id: encodeObjectId(room._id),
      // images: Array.isArray(room.images)
      //   ? room.images.map((img) => `${baseImageUrl}/rent-items/${img}`)
      //   : [],
      images: Array.isArray(room.images)
        ? room.images.map((img) =>
            img.startsWith("http") ? img : `${baseImageUrl}/rent-items/${img}`
          )
        : [],

      _id: undefined,
    }));

    return addCorsHeaders(
      NextResponse.json(
        { success: true, data: formattedRooms },
        { status: 200 }
      )
    );
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: "Something went wrong", details: err.message },
        { status: 500 }
      )
    );
  }
});
