import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
import LocationSetting from "../../../../../models/LocationSetting";
import ProductCategory from "../../../../../models/ProductCategory";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { encodeObjectId, decodeObjectId } from "../../../../../lib/idCodec";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = user?.id;
  const categoryEncoded = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword");

  // let query = {
  //   is_del: false,
  // };

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
      is_del: false,
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
      // { description: { $regex: keyword, $options: "i" } },
    ];
  }

  try {
    const products = await Product.find(query)
      .select("-__v -isDel")
      .populate("category", "name")
      .lean();

    // const baseImageUrl = `${
    //   process.env.IMAGE_URL || "http://localhost:3000/assets/images"
    // }/product-items`;

    const updatedItems = products.map((product) => ({
      ...product,
      id: encodeObjectId(product._id),
      // image: product.image ? `${baseImageUrl}/${product.image}` : null,
      // gallery: Array.isArray(product.gallery)
      //   ? product.gallery.map((img) => `${baseImageUrl}/${img}`)
      //   : [],
      image: product.image
        ? product.image.startsWith("http")
          ? product.image
          : `${baseImageUrl}/${product.image}`
        : null,

      gallery: Array.isArray(product.gallery)
        ? product.gallery.map((img) =>
            img.startsWith("http") ? img : `${baseImageUrl}/${img}`
          )
        : [],
      _id: undefined,
    }));

    return addCorsHeaders(
      NextResponse.json({ itemList: updatedItems }, { status: 200 })
    );
  } catch (err) {
    console.error("Search fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    );
  }
});
