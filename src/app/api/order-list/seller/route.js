import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Order from "../../../../../models/Order";
import MarketProduct from "../../../../../models/MarketProduct";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import User from "../../../../../models/User";

export async function OPTIONS() {
  return optionsResponse();
}

// Helper function (reuse from cart API)
const roundTwo = (num) => Math.round(num * 100) / 100;

export const GET = withAuth(async (req, user) => {
  await connectDB();

  const userId = user?.id;

  try {
    // Find orders where the logged-in user is a seller in any item
    const orders = await Order.find({ "items.sellerId": userId })
      .populate("items.productId")
      .populate("userId") // Populating buyer details
      .sort({ createdAt: -1 }); //latest orders first

    const sellerOrders = [];

    for (const order of orders) {
      const relevantItems = order.items.filter(
        (item) => item.sellerId?.toString() === userId.toString()
      );

      if (relevantItems.length === 0) continue;

      const orderSummary = {
        id: order._id,
        orderId: order.orderId,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        buyer: {
          name: order.userId?.name || "",
          image: order.userId?.image || "",
        },
        items: [],
        orderTotal: 0,
        currency: "", // Initialize currency
      };

      for (const item of relevantItems) {
        const product = item.productId;

        // Round price
        const unitPrice = roundTwo(item.price);
        const subtotal = roundTwo(unitPrice * item.quantity);

        orderSummary.items.push({
          _id: item._id,
          productId: product?._id,
          title: product?.title || "",
          price: unitPrice,
          quantity: item.quantity,
          images: product?.images || [],
          currency: product?.currency || "", // Use product currency
        });

     orderSummary.orderTotal = Number(
          (orderSummary.orderTotal + subtotal).toFixed(2)
        );

        // Set order currency from product (assume all items same currency)
        if (!orderSummary.currency && product?.currency) {
          orderSummary.currency = product.currency;
        }
      }

      sellerOrders.push(orderSummary);
    }

    return addCorsHeaders(
      NextResponse.json({ orders: sellerOrders }, { status: 200 })
    );
  } catch (error) {
    console.error("Error fetching seller order details:", error);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Error fetching seller order details" },
        { status: 500 }
      )
    );
  }
});
