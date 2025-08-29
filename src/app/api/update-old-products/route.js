import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Product from "../../../../models/Product";
import RoomItem from "../../../../models/Room";
import MarketProduct from "../../../../models/MarketProduct";
import User from "../../../../models/User";
import LocationSetting from "../../../../models/LocationSetting";
import Country from "../../../../models/Country";
import { withAuth } from "../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

async function updateCollection(Model, name) {
  const items = await Model.find({});
  let updated = 0;

  for (const item of items) {
    // Skip if already has currency
    if (item.currency) continue;

    // Find user’s location
    const location = await LocationSetting.findOne({ userId: item.createdBy });
    if (!location || !location.currentCountry) continue;

    let country = await Country.findById(location.currentCountry);

    // fallback: match by numeric "id"
    if (!country) {
      country = await Country.findOne({ id: location.currentCountry });
    }

    if (!country) {
      console.warn(`⚠️ No country found for ${name} item ${item._id}, skipping`);
      continue; // skip instead of saving invalid
    }

    // ✅ Assign missing fields before save
    item.currency = country.currency;
    item.country = country._id;

    try {
      await item.save();
      updated++;
    } catch (err) {
      console.error(`❌ Failed saving ${name} item ${item._id}:`, err.message);
    }
  }

  return { collection: name, updated };
}


// ✅ Proper export of GET
export async function GET(req) {
  return withAuth(async (req, user) => {
    await connectDB();

    try {
      const results = [];
      results.push(await updateCollection(Product, "products"));
      results.push(await updateCollection(RoomItem, "roomitems"));
      results.push(await updateCollection(MarketProduct, "marketproducts"));

      return addCorsHeaders(
        NextResponse.json({
          success: true,
          message: "Old products updated with currency successfully",
          results,
        })
      );
    } catch (error) {
      console.error("Migration error:", error);
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: "Failed to update old products" },
          { status: 500 }
        )
      );
    }
  })(req);
}

