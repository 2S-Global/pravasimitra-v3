import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MarketProduct from "../../../../../models/MarketProduct";
import { withAuth } from "../../../../../lib/withAuth";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";


/**
 * @description Soft-delete a  item by marking it as isDel=true
 * @route PATCH /api/marketplace/delete-product
 * @auth Required
 * @bodyparam {string} id - Encoded ID of the item to delete
 * @success {object} 200 - Item deleted successfullys
 * @error {object} 400 - Missing or invalid ID
 * @error {object} 500 - Invalid JSON or server error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const PATCH = withAuth(async (req, user) => {
  await connectDB();

  let data;

  try {
    data = await req.json();
  } catch {
    return addCorsHeaders(NextResponse.json({ msg: "Invalid JSON" }, { status: 500 }));
  }

  const { id } = data;

  if (!id) {
    return addCorsHeaders(NextResponse.json({ msg: "Missing Id" }, { status: 400 }));
  }

  let decodeId;
  try {
    decodeId = decodeObjectId(id);
  } catch (err) {
    return addCorsHeaders(NextResponse.json({ msg: "Invalid encoded ID" }, { status: 400 }));
  }

  const deleted = await MarketProduct.findByIdAndUpdate(
    { _id: decodeId, createdBy: user.id },
    { $set: { isDel: true } },
    { new: true }
  );

  return deleted
    ? addCorsHeaders(NextResponse.json(
        { msg: "Item deleted Successfully", item: deleted },
        { status: 200 }
      ))
    : addCorsHeaders(NextResponse.json(
        { msg: "Item not found or unauthorized" },
        { status: 404 }
      ));
});

