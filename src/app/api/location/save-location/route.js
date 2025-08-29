import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Country from "../../../../../models/Country";
import City from "../../../../../models/City";
import LocationSetting from "../../../../../models/LocationSetting";
import Cart from "../../../../../models/Cart";
import mongoose from "mongoose";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Save or update user's location preferences
 * @route POST /api/location/save-location
 * @auth Required
 * @body {string} currentCountry - ObjectId of current country
 * @body {string} currentCity - ObjectId of current city
 * @body {string} destinationCountry - ObjectId of destination country
 * @body {string} destinationCity - ObjectId of destination city
 * @success {object} 200 - Success message
 * @error {object} 400 - Missing required fields
 * @error {object} 500 - Database save failed
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const POST = withAuth(async function (req, user) {
  await connectDB();
  const { currentCountry, currentCity, destinationCountry, destinationCity } =
    await req.json();

  if (
    !currentCountry ||
    !currentCity ||
    !destinationCountry ||
    !destinationCity
  ) {
    return addCorsHeaders(
      NextResponse.json({ error: "All fields are required" }, { status: 400 })
    );
  }

  try {
    // // Soft-delete previous locations for this user
    // await LocationSetting.updateMany(
    //   { userId: user?.id, isDel: false },
    //   { $set: { isDel: true } }
    // );

    // Insert a new active location
    const saved = await LocationSetting.findOneAndUpdate(
      { userId: user?.id },
      {
        currentCountry: new mongoose.Types.ObjectId(currentCountry),
        currentCity: new mongoose.Types.ObjectId(currentCity),
        destinationCountry: new mongoose.Types.ObjectId(destinationCountry),
        destinationCity: new mongoose.Types.ObjectId(destinationCity),
      },
      { upsert: true, new: true }
    )
      .populate("currentCountry", "name")
      .populate("currentCity", "name")
      .populate("destinationCountry", "name")
      .populate("destinationCity", "name")
      .lean();

    // Hard delete user's cart after location change
    await Cart.deleteMany({ userId: user?.id });

    return addCorsHeaders(
      NextResponse.json(
        { message: "Location saved successfully", item: saved },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("DB save failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to save location" }, { status: 500 })
    );
  }
});
