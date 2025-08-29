import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import MarketProduct from "../../../../../models/MarketProduct";
import { withAuth } from "../../../../../lib/withAuth";
import MarketCategory from "../../../../../models/MarketCategory";
import User from "../../../../../models/User";
import City from "../../../../../models/City";
import Country from "../../../../../models/Country";
import { decodeObjectId,encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import cloudinary from "../../../../../lib/cloudinary";


/**
 * @description Get a single Item by its encoded ID  ss
 * @route GET /api/marketplace/details
 * @queryparam {string} id - Encoded Item ID
 * @success {object} 200 - Returns the Item data with encoded ID
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
    return addCorsHeaders(NextResponse.json(
      { error: "Missing Item ID in query" },
      { status: 400 }
    ));
  }

  try {
    const decodedId = decodeObjectId(encodedId); 

    const item = await MarketProduct.findOne({ _id: decodedId, isDel: false })
      .select("-__v -isDel")
      .populate("category", "name")
      .populate("createdBy", "name email mobile")
      .populate("city", "name")
      .populate("country", "name")
      .lean();

    if (!item) {
      return addCorsHeaders(NextResponse.json({ msg: "Item not found" }, { status: 404 }));
    }

    // item.images = item.images.map(filename => {
    //   return `${process.env.IMAGE_URL}/e-marketplace/${filename}`;
    // });

    // ✅ Use Cloudinary URLs directly if already present
    item.images = Array.isArray(item.images) ? item.images.map(img => img) : [];

    const updatedItem = {
      ...item,
      id: encodeObjectId(item._id),
    };
    delete updatedItem._id;

    return addCorsHeaders(NextResponse.json({ item: updatedItem }, { status: 200 }));
  } catch (err) {
    console.error("Fetch failed:", err);
    return addCorsHeaders(NextResponse.json(
      { error: "Invalid or malformed Marketproduct ID" },
      { status: 400 }
    ));
  }
};
