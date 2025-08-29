import { withAuth } from "../../../../../lib/withAuth";
import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import LocationSetting from "../../../../../models/LocationSetting";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

// CORS Preflight
export async function OPTIONS() {
  return optionsResponse();
}

// ======== Fetch only location IDs (GET) ================
export const GET = withAuth(async (req, user) => {
  try {
    await connectDB();
    const userId = user.id;

    const activeLocation = await LocationSetting.findOne({
      userId: userId,
      isDel: false
    })
      .select("currentCity currentCountry destinationCity destinationCountry -_id")
      .lean();

    // Default empty values
    const locationData = {
      currentCity: "",
      currentCountry: "",
      destinationCity: "",
      destinationCountry: ""
    };

    // If location exists, overwrite defaults
    if (activeLocation) {
      locationData.currentCity = activeLocation.currentCity?.toString() || "";
      locationData.currentCountry = activeLocation.currentCountry?.toString() || "";
      locationData.destinationCity = activeLocation.destinationCity?.toString() || "";
      locationData.destinationCountry = activeLocation.destinationCountry?.toString() || "";
    }

    return addCorsHeaders(
      NextResponse.json({
        msg: "Location fetched successfully",
        location: locationData,
      })
    );
  } catch (error) {
    console.error("Error fetching location:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
});
