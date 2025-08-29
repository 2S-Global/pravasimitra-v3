import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MarketProduct from "../../../../../models/MarketProduct";
import MarketCategory from "../../../../../models/MarketCategory";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { encodeObjectId, decodeObjectId } from "../../../../../lib/idCodec";
import { withAuth } from "../../../../../lib/withAuth"; 
import LocationSetting from "../../../../../models/LocationSetting";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req,user) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = user?.id;
  const categoryEncoded = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword");


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


  // Category filter
  if (categoryEncoded) {
    try {
      const categoryId = decodeObjectId(categoryEncoded);
      query.category = categoryId;
    } catch (err) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
      );
    }
  }

  // Keyword filter
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
    
    ];
  }

  try {
    const products = await MarketProduct.find(query)
      .select("-__v -isDel")
      .populate("category", "name")
      .lean();

    // const baseImageUrl = `${
    //   process.env.IMAGE_URL || "http://localhost:3000/assets/images"
    // }/e-marketplace`;

    const updatedProducts = products.map((product) => ({
      ...product,
      id: encodeObjectId(product._id),
      // images: product.images
      //   ? product.images.map((img) => `${baseImageUrl}/${img}`)
      //   : [],
      images: Array.isArray(product.images)
        ? product.images.map((img) =>
            img.startsWith("http") ? img : `${baseImageUrl}/e-marketplace/${img}`
          )
        : [],
      _id: undefined,
    }));

    return addCorsHeaders(
      NextResponse.json({ products: updatedProducts }, { status: 200 })
    );
  } catch (err) {
    console.error("Error fetching products:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    );
  }
});
