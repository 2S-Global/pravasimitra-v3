import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Amenity from "../../../../../models/Amenity";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";


export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  await connectDB();
  try {
    const amenities = await Amenity.find().sort({ name: 1 });
    return addCorsHeaders(
      NextResponse.json({ amenities }, { status: 200 })
    );
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 })
    );
  }
}
