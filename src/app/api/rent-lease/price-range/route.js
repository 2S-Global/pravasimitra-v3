import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import PriceRange from "../../../../../models/PriceRange";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Fetch or Create Price Ranges
 * @route GET /api/rent-lease/price-range
 * @query ?action=true  => Creates default price ranges only if collection is empty
 * @success {object} 200 - Returns price range list
 * @error {object} 500 - On DB failure or internal error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "true") {
      const existing = await PriceRange.find({});
      if (existing.length === 0) {
        const data = [
          { label: "$0 - $500", value: "0-500", min: 0, max: 500 },
          { label: "$500 - $1000", value: "500-1000", min: 500, max: 1000 },
          { label: "$1000+", value: "1000+", min: 1000, max: null },
        ];

        const result = await PriceRange.insertMany(ranges);

        return addCorsHeaders(
          NextResponse.json(
            { msg: "Price ranges created successfully", ranges: result },
            { status: 200 }
          )
        );
      } else {
        return addCorsHeaders(
          NextResponse.json(
            { msg: "Price ranges already exist", ranges: existing },
            { status: 200 }
          )
        );
      }
    } else {
      const ranges = await PriceRange.find({}).sort({ min: 1 });

      return addCorsHeaders(
        NextResponse.json(
          { msg: "Fetched price ranges", ranges },
          { status: 200 }
        )
      );
    }
  } catch (error) {
    console.error("Price range fetch/create failed:", error);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to fetch or create price ranges" },
        { status: 500 }
      )
    );
  }
}
