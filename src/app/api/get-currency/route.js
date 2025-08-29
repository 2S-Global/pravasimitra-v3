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

// ================ Get Currency ================
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

        let currency = "";

        // if country exists, fetch its currency
        if (activeLocation?.currentCountry) {
      const country = await Country.findById(activeLocation.currentCountry)
        .select("currency -_id")
        .lean();

      if (country?.currency) {
        currency = country.currency;
      }
    }

    return addCorsHeaders(
      NextResponse.json({
        msg: "Currency fetched successfully",
        currency,
      })
    );
  } catch (error) {
    console.error("Error fetching currency:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
});