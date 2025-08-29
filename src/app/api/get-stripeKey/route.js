import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { withAuth } from "../../../../lib/withAuth";
import LocationSetting from "../../../../models/LocationSetting";
import Country from "../../../../models/Country";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";

// Cors Preflight Response
export async function OPTIONS() {
  return optionsResponse();
}

// ================ Get Publishable Key ================
export const GET = withAuth(async (req, user) => {
  try {
    await connectDB();
    const userId = user.id;

    // Find user's active location setting
    const activeLocation = await LocationSetting.findOne({
      userId: userId,
      isDel: false,
    })
      .select("currentCountry -_id")
      .lean();

    let publishable_key = "";

    // if country exists, fetch its publishable_key
    if (activeLocation?.currentCountry) {
      const country = await Country.findById(activeLocation.currentCountry)
        .select("publishable_key -_id")
        .lean();

      if (country?.publishable_key) {
        publishable_key = country.publishable_key;
      }
    }

    return addCorsHeaders(
      NextResponse.json({
        msg: "Publishable key fetched successfully",
        publishable_key,
      })
    );
  } catch (error) {
    console.error("Error fetching publishable_key:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
});
