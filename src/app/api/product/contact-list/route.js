import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import ProductContact from "../../../../../models/ProductContact";
import User from "../../../../../models/User";
import Product from "../../../../../models/Product";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS(req) {
  return optionsResponse();
}

export const GET = async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const encodedProductId = searchParams.get("id");

  if (!encodedProductId) {
    return addCorsHeaders(NextResponse.json({ error: "Missing product ID" }, { status: 400 }));
  }

  let productId;
  try {
    productId = decodeObjectId(encodedProductId);
  } catch {
    return addCorsHeaders(NextResponse.json({ error: "Invalid product ID" }, { status: 400 }));
  }

  try {
    const contacts = await ProductContact.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email image")
      .lean();

    const response = contacts.map((entry) => ({
      name: entry.userId?.name,
      email: entry.userId?.email,
      image: entry.userId?.image || "/assets/images/default-user.png",
      contactedAt: entry.createdAt,
    }));

    return addCorsHeaders(NextResponse.json({ users: response }, { status: 200 }));
  } catch (err) {
    console.error("Contact fetch failed:", err);
    return addCorsHeaders(NextResponse.json({ error: "Failed to fetch contact list" }, { status: 500 }));
  }
};
