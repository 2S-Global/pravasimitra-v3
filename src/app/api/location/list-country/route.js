import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Country from "../../../../../models/Country";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Get all active countries
 * @route GET /api/location/list-country
 * @auth Not Required
 * @success {object} 200 - Returns array of countries
 * @error {object} 500 - Database query failed or server error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  await connectDB();

  try {
    const countries = await Country.find({ status: 1, is_del: 0 })
      .select("_id name currency")
      .sort({ name: 1 })
      .lean();

    return addCorsHeaders(
      NextResponse.json(
        { items: countries },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("DB fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to fetch countries" },
        { status: 500 }
      )
    );
  }
}
