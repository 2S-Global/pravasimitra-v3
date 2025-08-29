import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MembershipPlan from "../../../../../models/MembershipPlan";
import User from "../../../../../models/User";
import LocationSetting from "../../../../../models/LocationSetting";
import mongoose from "mongoose";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// FETCH PLANS FOR USER'S CURRENT COUNTRY + ACTIVE PLAN
export const GET = withAuth(async (req, user) => {
  await connectDB();

  try {
    // Find user's location setting
    const location = await LocationSetting.findOne({ userId: user.id }).lean();

    if (!location || !location.currentCountry) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, message: "User has no current country set" },
          { status: 400 }
        )
      );
    }

    const countryId = location.currentCountry;

    // Custom order for plans
    const order = ["Basic", "Silver", "Gold", "Platinum"];

    // Fetch only plans for user's current country
    let plans = await MembershipPlan.find({
      countryId: new mongoose.Types.ObjectId(countryId),
      isActive: true,
    }).lean();

    // Sort according to custom order
    plans.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

    // Get user (for active plan)
    const dbUser = await User.findById(user.id).lean();

    return addCorsHeaders(
      NextResponse.json(
        {
          success: true,
          data: {
            plans,
            userPlanId: dbUser?.membershipId || null,
            userCountryId: countryId,
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
