import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import RoomCategory from "../../../../../models/RoomCategory";
import LocationSetting from "../../../../../models/LocationSetting";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { encodeObjectId, decodeObjectId } from "../../../../../lib/idCodec";
import { withAuth } from "../../../../../lib/withAuth";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async function (req, user) {
  await connectDB();

  const userId = user?.id;
  const { searchParams } = new URL(req.url);

  const location = searchParams.get("location");
  const priceRange = searchParams.get("priceRange");
  const bedrooms = searchParams.get("bedrooms");
  const categoryEncoded = searchParams.get("categoryId");

  const baseImageUrl = process.env.IMAGE_URL;

  // Fetch current location settings from DB
  const locationSetting = await LocationSetting.findOne({ userId: userId });
  if (!locationSetting) {
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: "Location settings not found" },
        { status: 404 }
      )
    );
  }

  const query = {
    isDel: false,
    createdBy: { $ne: userId }, // Exclude user's own listings
    // city: locationSetting.currentCity,
    country: locationSetting.currentCountry,
  };

  // Location filter (case-insensitive partial match)
  if (location) {
    const regex = new RegExp(location, "i");
    query.$or = [{ location: { $regex: regex } }];
  }

  // Price range filter
  if (priceRange) {
    if (priceRange.includes("+")) {
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

  // Bedrooms filter
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

  // Category filter
  if (categoryEncoded) {
    const category = decodeObjectId(categoryEncoded);
    query.propertyType = category;
  }

  try {
    const rooms = await RoomItem.find(query).populate("propertyType");

    const formattedRooms = rooms.map((room) => ({
      ...room.toObject(),
      id: encodeObjectId(room._id),
      images: Array.isArray(room.images)
        ? room.images.map((img) =>
            img.startsWith("http") ? img : `${baseImageUrl}/rent-items/${img}`
          )
        : [],
      _id: undefined,
    }));

    return addCorsHeaders(
      NextResponse.json({ success: true, data: formattedRooms }, { status: 200 })
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
