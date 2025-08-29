import Stripe from "stripe";
import { NextResponse } from "next/server";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors copy";
import { connectDB } from "../../../../lib/db";
import Country from "../../../../models/Country";

export async function OPTIONS() {
  return optionsResponse();
}

export const POST = async (req) => {
  try {
    await connectDB();

    const { cartItems, successUrl, cancelUrl, currencyName, countryId } = await req.json();

    if (!cartItems || !successUrl || !cancelUrl || !currencyName || !countryId) {
      return addCorsHeaders(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }

    // Fetch secret_key from Country collection using countryId
    const country = await Country.findById(countryId)
      .select("secret_key")
      .lean();

    if (!country?.secret_key) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Stripe secret key not found for country." },
          { status: 404 }
        )
      );
    }

    // Initialize Stripe with country-specific secret key
    const stripe = new Stripe(country.secret_key);

    // Use currencyName from request
    const selectedCurrency = currencyName?.toLowerCase();

    // Prepare line items
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: selectedCurrency,
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100), // convert to smallest unit
      },
      quantity: item.quantity,
    }));

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return addCorsHeaders(
      NextResponse.json({ id: session.id, url: session.url }, { status: 200 })
    );
  } catch (err) {
    console.error("Stripe session error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 500 })
    );
  }
};