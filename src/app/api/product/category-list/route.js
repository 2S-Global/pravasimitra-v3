import { connectDB } from "../../../../../lib/db";
import ProductCategory from "../../../../../models/ProductCategory";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { encodeObjectId } from "../../../../../lib/idCodec";

export async function OPTIONS() {
  return optionsResponse();
}

// GET all product categories (not soft-deleted)
export async function GET() {
  try {
    await connectDB();

    const categoriesRaw = await ProductCategory.find({ isDel: false })
      .sort({ createdAt: -1 })
      .lean();

    if (!categoriesRaw || categoriesRaw.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { msg: "No product categories found" },
        { status: 404 }
      ));
    }

    // Map and encode ID
    const categories = categoriesRaw.map((cat) => ({
      id: encodeObjectId(cat._id),
      name: cat.name,
      // image: cat.image || "",
      image: cat.image ? `${process.env.IMAGE_URL}/product-category/${cat.image}` : "",
      icon: cat.icon || "",
    }));

    return addCorsHeaders(NextResponse.json(
      { msg: "Product categories fetched successfully", categories },
      { status: 200 }
    ));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      {
        error: "Failed to fetch product categories",
        details: error.message,
      },
      { status: 500 }
    ));
  }
}
