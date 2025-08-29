// app/api/transaction/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Transaction from "../../../../models/Transaction";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import { withAuth } from "../../../../lib/withAuth";
import LocationSetting from "../../../../models/LocationSetting";
import Country from "../../../../models/Country";

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

    //Get user's active location
    const activeLocation = await LocationSetting.findOne({
      userId: user.id,
      isDel: false,
    })
      .select("currentCountry -_id")
      .lean();

    if (!activeLocation?.currentCountry) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "No active country found for user." },
          { status: 404 }
        )
      );
    }

    //Fetch secret_key from the country table
    const country = await Country.findById(activeLocation.currentCountry)
      .select("secret_key -_id")
      .lean();

    if (!country?.secret_key) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Stripe secret key not found for country." },
          { status: 500 }
        )
      );
    }

    // Initialize Stripe with country-specific secret key
    const stripe = new Stripe(country.secret_key);

    // Retrieve the Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
      );
    }

    // Save transaction details to DB
    const newTransaction = new Transaction({
      // userId: user.id, // optional: track who paid
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_details?.email || "",
      amountTotal: session.amount_total / 100,
      currency: session.currency,
      paymentStatus: session.payment_status,
      rawSession: session, // optional, store full session object if needed
    });

    await newTransaction.save();

    return addCorsHeaders(NextResponse.json(newTransaction, { status: 201 }));
  } catch (error) {
    console.error("Transaction save error:", error);
    return addCorsHeaders(
      NextResponse.json({ error: error.message }, { status: 500 })
    );
  }
});
