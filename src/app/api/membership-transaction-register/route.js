import Stripe from "stripe";
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import MembershipTransaction from "../../../../models/MembershipTransaction";
import Country from "../../../../models/Country";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors copy";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  await connectDB();

  try {
    const { sessionId, countryId } = await req.json();

    if (!sessionId || !countryId) {
      return addCorsHeaders(
        NextResponse.json({ error: "Missing sessionId or countryId" }, { status: 400 })
      );
    }

    // Find country and fetch secret key
    const country = await Country.findById(countryId);
    if (!country || !country.secret_key) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid country or missing Stripe secret key" }, { status: 400 })
      );
    }

    // Initialize stripe dynamically
    const stripe = new Stripe(country.secret_key);

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid sessionId" }, { status: 400 })
      );
    }

    // Save transaction in DB
    const newTransaction = new MembershipTransaction({
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_details?.email || "",
      amountTotal: session.amount_total / 100,
      currency: session.currency,
      paymentStatus: session.payment_status,
      rawSession: session,
      country: country._id, // optional, track which country’s key was used
    });

    await newTransaction.save();

    return addCorsHeaders(NextResponse.json(newTransaction, { status: 201 }));
  } catch (err) {
    console.error("MembershipTransaction save error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 500 })
    );
  }
}