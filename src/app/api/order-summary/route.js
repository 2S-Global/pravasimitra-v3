import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Cart from "../../../../models/Cart";
import MarketProduct from "../../../../models/MarketProduct";
import { withAuth } from "../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// Helper to round to 2 decimal places
const roundTwo = (num) => Math.round(num * 100) / 100;

export const POST = withAuth(async (req, user) => {
  await connectDB();

  try {
    const cart = await Cart.findOne({ userId: user.id }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return addCorsHeaders(
        NextResponse.json(
          {
            summary: {
              price: "0.00",
              items: "0",
              totalAmount: "0.00",
              currency: "",
            },
          },
          { status: 200 }
        )
      );
    }

    let uniqueItemCount = 0;
    let totalMRP = 0;
    let totalAmount = 0;
    let currency = "";

    const uniqueProducts = new Set();

    cart.items.forEach((item) => {
      const product = item.productId;
      const quantity = item.quantity || 1;

      // Set currency from first product
      if (!currency && product?.currency) {
        currency = product.currency;
      }

      // Unique item count by product ID
      if (!uniqueProducts.has(product._id.toString())) {
        uniqueProducts.add(product._id.toString());
        uniqueItemCount += 1;
      }

      totalMRP += (product.mrp || product.price || 0) * quantity;
      totalAmount += (product?.price || 0) * quantity;
    });

    // Round totals before returning
    totalMRP = roundTwo(totalMRP);
    totalAmount = roundTwo(totalAmount);

    return addCorsHeaders(
      NextResponse.json(
        // {
        //   summary: {
        //     price: `${totalMRP}`,
        //     items: `${uniqueItemCount}`,
        //     totalAmount: `${totalAmount}`,
        //   },
        {
          summary: {
            price: totalMRP.toFixed(2),
            items: `${uniqueItemCount}`,
            totalAmount: totalAmount.toFixed(2),
            currency: currency || "",
          },
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Order Summary Error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    );
  }
});
