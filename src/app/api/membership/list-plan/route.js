import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MembershipPlan from "../../../../../models/MembershipPlan";
import mongoose from "mongoose";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// FETCH MEMBERSHIP PLAN LIST BY COUNTRY (GET)
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "countryId is required" },
          { status: 400 }
        )
      );
    }

    const plans = await MembershipPlan.aggregate([
      {
        $match: {
          countryId: new mongoose.Types.ObjectId(countryId) , // filter by country
          isActive: true,
        },
      },
      {
        $addFields: {
          sortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$name", "Basic"] }, then: 1 },
                { case: { $eq: ["$name", "Silver"] }, then: 2 },
                { case: { $eq: ["$name", "Gold"] }, then: 3 },
                { case: { $eq: ["$name", "Platinum"] }, then: 4 },
              ],
              default: 999,
            },
          },
        },
      },
      { $sort: { sortOrder: 1 } },
      { $project: { sortOrder: 0 } },
    ]);

    return addCorsHeaders(
      NextResponse.json(
        {
          success: true,
          data: plans,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Error fetching membership plans:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Database fetch failed" }, { status: 500 })
    );
  }
}
