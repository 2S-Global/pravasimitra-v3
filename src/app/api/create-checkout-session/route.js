// app/api/create-checkout-session/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { addCorsHeaders, optionsResponse } from '../../../../lib/cors';
import { connectDB } from '../../../../lib/db';
import { withAuth } from '../../../../lib/withAuth';
import LocationSetting from '../../../../models/LocationSetting';
import Country from '../../../../models/Country';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Handle CORS preflight
export async function OPTIONS() {
  return optionsResponse();
}

// Handle POST request to create Stripe Checkout Session
export const POST = withAuth(async (req, user) => {
  try {
    await connectDB();

    const { cartItems, successUrl, cancelUrl, currencyName } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return addCorsHeaders(
        NextResponse.json({ error: "Cart is empty." }, { status: 400 })
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

    //  Use currencyName from request
    const selectedCurrency = currencyName?.toLowerCase();

    // Prepare Stripe line items in GBP
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: selectedCurrency,
        product_data: {
          name: item.product?.title || item.title,
          images: item.product?.images || [], // Optional: pass product images
        },
        unit_amount: Math.round((item.product?.price || item.price) * 100), // amount in pence
      },
      quantity: item.quantity,
    }));

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    const res = NextResponse.json({ url: session.url }, { status: 200 });
    return addCorsHeaders(res); 

  } catch (error) {
    console.error('Stripe session error:', error);
    const res = NextResponse.json({ error: error.message }, { status: 500 });
    return addCorsHeaders(res);
  }
});
