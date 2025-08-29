import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MembershipPlan from "../../../../../models/MembershipPlan";
import User from "../../../../../models/User";
import mongoose from "mongoose";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// FETCH PLANS AGAINST COUNTRY + CURRENT USER'S ACTIVE PLAN
export const GET = withAuth(async (req, user) => {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, message: "countryId is required" },
          { status: 400 }
        )
      );
    }

    // Custom order for plans
    const order = ["Basic", "Silver", "Gold", "Platinum"];

    // Fetch only plans for this country
    let plans = await MembershipPlan.find({
      countryId: new mongoose.Types.ObjectId(countryId),
      isActive: true,
    }).lean();

    // Sort according to custom order
    plans.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

    // Get the current user
    const dbUser = await User.findById(user.id).lean();

    if (!dbUser) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        )
      );
    }

    return addCorsHeaders(
      NextResponse.json(
        {
          success: true,
          data: {
            plans,
            userPlanId: dbUser.membershipId || null,
          },
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Error fetching plans:", err);
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      )
    );
  }
});
