import Stripe from "stripe";
import { NextResponse } from "next/server";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import { connectDB } from "../../../../lib/db";
import { withAuth } from "../../../../lib/withAuth";
import LocationSetting from "../../../../models/LocationSetting";
import Country from "../../../../models/Country";


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function OPTIONS() {
  return optionsResponse();
}

export const POST = withAuth(async (req, user) => {
  try {
    await connectDB();

    const { cartItems, successUrl, cancelUrl, currencyName } = await req.json();

    if (!cartItems || !successUrl || !cancelUrl || !currencyName) {
      return addCorsHeaders(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 }) 
      );
    }

    // Find user's active location
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

    // Fetch secret_key from the country table
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

    // Use currencyName from request
    const selectedCurrency = currencyName?.toLowerCase();

    // prepare line items
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: selectedCurrency,
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100), // Price in smallest unit
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // line_items: cartItems.map((item) => ({ 
      //   price_data: {
      //     currency: selectedCurrency,
      //     product_data: { name: item.title },
      //     unit_amount: Math.round(item.price * 100), // Price in pence
      //   },
      //   quantity: item.quantity,
      // })),
      mode: "payment",
      line_items,
      success_url: successUrl, 
      cancel_url: cancelUrl,
    });

    return addCorsHeaders(
      NextResponse.json(
        { id: session.id, url: session.url },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Stripe session error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 500 })
    );
  }
});