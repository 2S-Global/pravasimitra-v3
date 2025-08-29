import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import RoomCategory from "../../../../../models/RoomCategory";
import { decodeObjectId, encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";
import { withAuth } from "../../../../../lib/withAuth";

/**
 * @description Get all room items for a given property type ID
 * @route GET /api/rent-lease/item-list
 * @queryparam {string} id - Encoded propertyType ID (required)
 * @success {object} 200 - Room items fetched successfully
 * @error {object} 400 - Missing or invalid propertyType ID
 * @error {object} 500 - Failed to fetch items from the database
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const propertyTypeEncoded = searchParams.get("id");

  const userId = user?.id;
  if (!propertyTypeEncoded) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Missing propertyType ID in query" },
        { status: 400 }
      )
    );
  }

  let query = { isDel: false };

  try {
    const categoryId = decodeObjectId(propertyTypeEncoded);

    if (
      !categoryId ||
      typeof categoryId !== "object" ||
      !categoryId._bsontype
    ) {
      throw new Error("Invalid ObjectId");
    }

    query.propertyType = categoryId;
  } catch (err) {
    console.error("ID decoding failed:", err.message);
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid propertyType ID" }, { status: 400 })
    );
  }

  try {
    // Get user's location setting
    const location = await LocationSetting.findOne({ userId })
      .select("currentCity currentCountry")
      .lean();

    if (!location || !location.currentCity || !location.currentCountry) {
      return addCorsHeaders(
        NextResponse.json({ error: "User location not set" }, { status: 400 })
      );
    }

    // Get currency based on current country
    let currency = "";
    const country = await Country.findById(location.currentCountry)
      .select("currency -_id")
      .lean();
    if (country?.currency) {
      currency = country.currency;
    }

    // Filter: exclude products posted by this user & match city & country
    query.createdBy = { $ne: userId };
    // query.city = location.currentCity;
    query.country = location.currentCountry;

    const items = await RoomItem.find(query)
      .select("-__v -isDel")
      .populate("propertyType", "name")

      .lean();

    if (!items.length) {
      return addCorsHeaders(
        NextResponse.json(
          { msg: "No items available", itemList: [] },
          { status: 200 }
        )
      );
    }

    //const baseImageUrl = process.env.IMAGE_URL + "/rent-items";

    // const updatedItems = items.map((item) => ({
    //   ...item,
    //   id: encodeObjectId(item._id),
    //   _id: undefined,
    //   images: Array.isArray(item.images)
    //     ? item.images.map((img) => `${baseImageUrl}/${img}`)
    //     : [],
    // }));

    const updatedItems = items.map((item) => ({
      ...item,
      id: encodeObjectId(item._id),
      _id: undefined,
      images: Array.isArray(item.images)
        ? item.images.map((img) => img) // return full Cloudinary URLs
        : [],
    }));

    return addCorsHeaders(
      NextResponse.json({ itemList: updatedItems }, { status: 200 })
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    );
  }
});
