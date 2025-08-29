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

// Upgrade Membership Plan (Ack only)
export const POST = withAuth(async (req, user) => {
  await connectDB();

  try {
    const { planId } = await req.json();

    if (!planId) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, message: "planId is required" },
          { status: 400 }
        )
      );
    }

    // Get user's current country from location_settings
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

    // Check if plan exists for that country
    const plan = await MembershipPlan.findOne({
      _id: new mongoose.Types.ObjectId(planId),
      countryId: new mongoose.Types.ObjectId(countryId),
      isActive: true,
    }).lean();

    if (!plan) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, message: "Membership plan not found for your current country" },
          { status: 404 }
        )
      );
    }

    // Update user's membership
    await User.findByIdAndUpdate(user.id, { membershipId: planId });

    return addCorsHeaders(
      NextResponse.json(
        {
          success: true,
          message: "Membership upgraded successfully",
          upgradedPlan: {
            id: plan._id,
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            currencyName: plan.currencyName,
            durationInDays: plan.durationInDays,
          },
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Error upgrading membership:", err);
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      )
    );
  }
});
