import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
import ProductCategory from "../../../../../models/ProductCategory";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";
import { decodeObjectId, encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { withAuth } from "../../../../../lib/withAuth";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const categoryEncoded = searchParams.get("id");
  const userId = user?.id;

  if (!categoryEncoded) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Missing category ID in query" },
        { status: 400 }
      )
    );
  }

  let query = { is_del: false };

  // Decode category ID
  try {
    const categoryId = decodeObjectId(categoryEncoded);
    if (!categoryId || typeof categoryId !== "object" || !categoryId._bsontype) {
      throw new Error("Invalid ObjectId");
    }
    query.category = categoryId;
  } catch (err) {
    console.error("ID decoding failed:", err.message);
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    );
  }

  try {
    // Get user's location setting
    const location = await LocationSetting.findOne({ userId })
      .select("currentCity currentCountry")
      .lean();

    if (!location || !location.currentCity || !location.currentCountry) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "User location not set" },
          { status: 400 }
        )
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

    const products = await Product.find(query)
      .select("-__v -is_del")
      .populate("category", "name")

      .lean();

    if (!products.length) {
      return addCorsHeaders(
        NextResponse.json(
          { msg: "No products available", productList: [] },
          { status: 200 }
        )
      );
    }

    const updatedProducts = products.map((product) => ({
      ...product,
      id: encodeObjectId(product._id),
      _id: undefined,
      image: product.image || null,
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
    }));

    return addCorsHeaders(
      NextResponse.json(
        {
          msg: "Products loaded successfully",
          currency,
          productList: updatedProducts,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    );
  }
});
