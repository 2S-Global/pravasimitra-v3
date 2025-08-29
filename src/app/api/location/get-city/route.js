import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import City from "../../../../../models/City";
import mongoose from "mongoose";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Get cities by country ID
 * @route POST /api/location/get-city
 * @auth Not Required
 * @body {string} countryId - MongoDB ObjectId of the country
 * @success {object} 200 - Returns array of cities
 * @error {object} 400 - Missing countryId
 * @error {object} 500 - Database query failed or server error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  await connectDB();
  const { countryId } = await req.json();

  if (!countryId) {
    return addCorsHeaders(
      NextResponse.json({ error: "countryId is required" }, { status: 400 })
    );
  }

  try {
    const cities = await City.find({
      country_id: new mongoose.Types.ObjectId(countryId),
      is_del: 0
    })
      .populate("country_id", "name status")
      .select("_id name country_id")
      .sort({ name: 1 })
      .lean();

    return addCorsHeaders(NextResponse.json({ items: cities }, { status: 200 }));
  } catch (err) {
    console.error("DB fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 })
    );
  }
}
