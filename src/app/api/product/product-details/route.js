import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
import ProductCategory from "../../../../../models/ProductCategory";
import { withAuth } from "../../../../../lib/withAuth";
import User from "../../../../../models/User";
import City from "../../../../../models/City";
import Country from "../../../../../models/Country";
import { decodeObjectId, encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Get a single Product by its encoded ID
 * @route GET /api/product/details
 * @queryparam {string} id - Encoded Product ID
 * @success {object} 200 - Returns the Product data with encoded ID
 * @error {object} 400 - Missing or invalid ID in query
 * @error {object} 404 - Product not found
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
        { error: "Missing Product ID in query" },
        { status: 400 }
      )
    );
  }

  try {
    const decodedId = decodeObjectId(encodedId);

    const product = await Product.findOne({ _id: decodedId, is_del: false })
      .select("-__v -is_del")
      .populate("category", "name")
      .populate("createdBy", "name email mobile")
      .populate("city", "name")
      .populate("country", "name")
      .lean();

    if (!product) {
      return addCorsHeaders(
        NextResponse.json({ msg: "Product not found" }, { status: 404 })
      );
    }

    //const baseImageUrl = process.env.IMAGE_URL + "/product-items";

    const updatedProduct = {
      ...product,
      id: encodeObjectId(product._id),
      image: product.image || null, //full URL from Cloudinary
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
    };
    delete updatedProduct._id;

    return addCorsHeaders(
      NextResponse.json({ item: updatedProduct }, { status: 200 })
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid Product ID" }, { status: 400 })
    );
  }
};
