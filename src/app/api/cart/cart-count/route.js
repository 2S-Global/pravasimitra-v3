import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Cart from "../../../../../models/Cart";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// ======= GET Cart Count =========
export const GET = withAuth(async (req, user) => {
  await connectDB();

  // Check authentication
  if (!user?.id) {
    return addCorsHeaders(
      NextResponse.json({ error: "Authentication required" }, { status: 401 })
    );
  }

  try {
    // Find cart for this user
    const cart = await Cart.findOne({ userId: user.id }).lean();

    if (!cart || !cart.items.length) {
      // If no cart or no items
      return addCorsHeaders(
        NextResponse.json({ cartCount: 0 }, { status: 200 })
      );
    }

    // Count total quantity of all items
    // const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

     // Count number of distinct items (not total quantity)
    const cartCount = cart.items.length;

    // Return response
    return addCorsHeaders(
      NextResponse.json({ cartCount: cartCount }, { status: 200 })
    );

  } catch (err) {
    console.error("Get cart count error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});