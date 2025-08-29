import Stripe from "stripe";
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import MembershipTransaction from "../../../../models/MembershipTransaction";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import LocationSetting from "../../../../models/LocationSetting";
import Country from "../../../../models/Country";
import User from "../../../../models/User";
import { withAuth } from "../../../../lib/withAuth";
import mongoose from "mongoose";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function OPTIONS() {
  return optionsResponse();
}

export const POST = withAuth(async (req, user) => {
  await connectDB();

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return addCorsHeaders(
        NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
      );
    }

    // Find user's location setting
    const locationSetting = await LocationSetting.findOne({ userId: user.id });
    if (!locationSetting) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "User location setting not found" },
          { status: 400 }
        )
      );
    }

    const countryId=locationSetting.currentCountry;
let country;
    // Fetch country to get stripe secret key
if (mongoose.Types.ObjectId.isValid(countryId)) {
  country = await Country.findById(countryId); // works with both string or ObjectId
} else {
  country = await Country.findOne({ countryId }); // fallback if you store as custom field
}
    

    if (!country) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Country or Stripe key not found" },
          { status: 400 }
        )
      );
    }

    // Initialize Stripe with the country's secret key
    const stripe = new Stripe(country.secret_key);
console.log("Stripe Secret Key:", country.secret_key, typeof country.secret_key);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid sessionId" }, { status: 400 })
      );
    }

    const newTransaction = new MembershipTransaction({
      userId: user.id,
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_details?.email || "",
      amountTotal: session.amount_total / 100,
      currency: session.currency,
      paymentStatus: session.payment_status,
      rawSession: session,
    });

    await newTransaction.save();

    return addCorsHeaders(
      NextResponse.json(newTransaction, { status: 201 })
    );
  } catch (err) {
    console.error("MembershipTransaction save error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 500 })
    );
  }
}); 
