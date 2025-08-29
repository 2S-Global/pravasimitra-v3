import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Order from "../../../../models/Order";
import { withAuth } from "../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import MarketProduct from "../../../../models/MarketProduct";
import Address from "../../../../models/Address";
import User from '../../../../models/User';

export async function OPTIONS() {
  return optionsResponse();
}

// Helper: round to 2 decimals
const roundTwo = (num) => Math.round((num || 0) * 100) / 100;

export const GET = withAuth(async (req, user) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return addCorsHeaders(
      NextResponse.json({ error: "Missing orderId in query" }, { status: 400 })
    );
  }

  try {
    const order = await Order.findOne({
      _id: orderId,
      "items.sellerId": user.id, 
    })
      .populate("items.productId")
      .populate("userId")
      .populate("addressId"); 

    if (!order) {
      return addCorsHeaders(
        NextResponse.json({ error: "Order not found" }, { status: 404 })
      );
    }

    const relevantItems = order.items.filter(
      (item) => item.sellerId?.toString() === user.id.toString()
    );

    const summary = {
      orderId: order.orderId,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      status: order.status || "",
      buyer: {
        name: order.userId?.name || "",
        image: order.userId?.image || "",
      },
      address: order.addressId
        ? {
            _id: order.addressId._id,
            billing: order.addressId.billing || {},
            shipping: order.addressId.shipping || {},
          }
        : null,
      items: [],
      orderTotal: 0,
      currency: "",
    };

    for (const item of relevantItems) {
      const product = item.productId;
      const unitPrice = roundTwo(item.price);
      const subtotal = roundTwo(unitPrice * item.quantity);

      summary.items.push({
        _id: item._id,
        productId: product?._id,
        title: product?.title || "",
        price: unitPrice,
        quantity: item.quantity,
        subtotal,
        images: product?.images || [],
        currency: product?.currency || "",
      });
      summary.orderTotal += subtotal;

      // Set summary currency from first product if available
      if (!summary.currency && product?.currency) {
        summary.currency = product.currency;
      } 
    }

    // Final rounded total
    summary.orderTotal = roundTwo(summary.orderTotal);
    

    return addCorsHeaders(NextResponse.json({ order: summary }, { status: 200 }));
  } catch (error) {
    console.error("Error fetching order:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Error fetching order" }, { status: 500 })
    );
  }
});
