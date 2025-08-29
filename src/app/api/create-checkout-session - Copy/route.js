// app/api/create-checkout-session/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { addCorsHeaders, optionsResponse } from '../../../../lib/cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Handle CORS preflight
export async function OPTIONS() {
  return optionsResponse();
}

// Handle POST request to create Stripe Checkout Session
export async function POST(req) {
  try {
    const { cartItems, successUrl, cancelUrl, currencyName } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Cart is empty.' }, { status: 400 })
      );
    }

        const selectedCurrency = currencyName?.toLowerCase();

    // Prepare Stripe line items in GBP
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: selectedCurrency, // Pound Sterling
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
}
