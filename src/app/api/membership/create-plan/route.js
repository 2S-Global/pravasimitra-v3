import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import MembershipPlan from "../../../../../models/MembershipPlan";
import Country from "../../../../../models/Country";
import mongoose from "mongoose";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { error } from "jquery";


export async function OPTIONS() {
  return optionsResponse();
}

// CREATE MEMBERSHIP PLAN (POST)
export const POST = withAuth(async function (req, user) {
  await connectDB();

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
    );
  }

  const { name, price, limits, durationInDays, isActive, countryId } = body;

  // console.log("Request body received:", body);


  if (!name || !durationInDays || price === undefined || !countryId) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Name, price, durationInDays and countryId are required" },
        { status: 400 }
      )
    );
  }

  try {
    // Fetch country to get currency & currencyName
    const country = await Country.findById(countryId);
    if (!country) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid countryId" }, { status: 404 })
      );
    }

    console.log("Country found:", country.currencyName);

    // Create new membership plan
    const newPlan = await MembershipPlan.create({
      name,
      price,
      countryId,
      currency: country.currency,
      currencyName: country.currencyName,
      limits: limits || { buySell: 0, rentLease: 0, marketplace: 0 },
      durationInDays,
      isActive: isActive !== undefined ? isActive : true,
      
    });

    // console.log("New plan created:", newPlan);

    return addCorsHeaders(
      NextResponse.json(
        {
          msg: "Membership plan created successfully",
          plan: newPlan,
          createdBy: user?.id,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Error creating membership plan:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Database insert failed" }, { status: 500 })
    );
  }
});