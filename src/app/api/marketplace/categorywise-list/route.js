import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MarketCategory from "../../../../../models/MarketCategory";
import { decodeObjectId, encodeObjectId } from "../../../../../lib/idCodec";
import MarketProduct from "../../../../../models/MarketProduct";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import cloudinary from "../../../../../lib/cloudinary";
import { withAuth } from "../../../../../lib/withAuth";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";

/**
 * @description Get all MarketProduct items for a given category ID (only those not marked as deleted)
 * @route GET /api/marketplace/categorywise-list
 * @queryparam {string} id - Encoded category ID
 * @success {object} 200 - Returns an array of MarketProduct items with encoded IDs
 * @error {object} 400 - Missing or invalid category ID
 * @error {object} 500 - Database query failed or server error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
  await connectDB();
  const userId = user?.id;
  const { searchParams } = new URL(req.url);
  // const category = searchParams.get("id");
  const categoryIdEncoded = searchParams.get("id");

  if (!categoryIdEncoded) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Missing Category ID in query" },
        { status: 400 }
      )
    );
  }

  let query = { isDel: false };

  try {
    const categoryId = decodeObjectId(categoryIdEncoded);
    // console.log(categoryId);

    if (
      !categoryId ||
      typeof categoryId !== "object" ||
      !categoryId._bsontype
    ) {
      throw new Error("Invalid ObjectId");
    }

    query.category = categoryId;
  } catch (err) {
    console.error("ID decoding failed:", err.message);
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid propertyType ID" }, { status: 400 })
    );
  }

  try {
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

    query.createdBy = { $ne: userId };
    // query.city = location.currentCity;
    query.country = location.currentCountry;

    const items = await MarketProduct.find(query)
      .select("-__v -isDel")
      .populate("category", "name")

      .lean();

    if (!items.length) {
      return addCorsHeaders(
        NextResponse.json(
          { msg: "No items available", itemList: [] },
          { status: 200 }
        )
      );
    }

    //const baseImageUrl = process.env.IMAGE_URL + "/e-marketplace";

    const updatedItems = items.map((item) => ({
      ...item,
      id: encodeObjectId(item._id),
      _id: undefined,
      // images: Array.isArray(item.images)
      //  ? item.images.map((img) => `${baseImageUrl}/${img}`)
      //   : [],
      images: Array.isArray(item.images) ? item.images.map((img) => img) : [],
    }));

    return addCorsHeaders(
      NextResponse.json(
        {
          msg: "Marketplace items loaded successfully",
          itemList: updatedItems,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    );
  }
});
