import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { withAuth } from "../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import Order from "../../../../models/Order";
import User from "../../../../models/User";
import Address from "../../../../models/Address";
import { encodeObjectId } from "../../../../lib/idCodec";

export async function OPTIONS() {
  return optionsResponse();  
}

// Helper to round numbers to 2 decimals
const roundTwo = (num) => Math.round(num * 100) / 100; 

export const GET = withAuth(async (req) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const order = await Order.findById(orderId)
      .populate("userId")
      .populate("addressId")
      .populate("items.productId");

    if (!order) {
      return addCorsHeaders(
        NextResponse.json({ error: "Order not found" }, { status: 404 })
      );
    }

    const buyer = await User.findById(order.userId).lean();
    const buyerSince = buyer?.createdAt
      ? buyer.createdAt.toISOString().split("T")[0]
      : null;

    // Extract currency from first product (if available)
    const currency =
      order.items.length > 0 && order.items[0].productId?.currency
        ? order.items[0].productId.currency
        : null;

    const responseOrder = {
      _id: encodeObjectId(order._id),
      orderId: order.orderId,
      status: order.status,
      totalAmount: roundTwo(order.totalAmount),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      currency,
      buyer: buyer
        ? {
            _id: encodeObjectId(buyer._id),
            name: buyer.name,
            image: order.userId?.image || "",
            email: buyer.email,
            phone: buyer.phone,
            buyerSince,
          }
        : null,
      address: order.addressId
        ? {
            _id: encodeObjectId(order.addressId._id),
            billing: order.addressId.billing,
            shipping: order.addressId.shipping,
          }
        : null,
      items: order.items.map((item) => {
        const product = item.productId;
        const unitPrice = roundTwo(item.price || 0);
        const subtotal = roundTwo(unitPrice * (item.quantity || 0));

        return {
          _id: encodeObjectId(item._id),
          productId: encodeObjectId(product?._id),
          quantity: item.quantity,
          price: unitPrice,
          subtotal,
          productDetails: product
            ? {
                _id: encodeObjectId(product._id),
                title: product.title,
                price: roundTwo(product.price),
                images: product.images,
                description: product.description,
                currency: product.currency,
              }
            : null,
        };
      }),
    };

    // const calculatedTotal = order.items.reduce((sum, item) => {
    //   return sum + item.price * item.quantity;
    // }, 0);

    // Recalculate total from rounded subtotals
    const calculatedTotal = responseOrder.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    responseOrder.calculatedTotal = roundTwo(calculatedTotal);

    return addCorsHeaders(
      NextResponse.json({ orderDetails: responseOrder }, { status: 200 })
    );
  } catch (error) {
    console.error("Error fetching order details:", error);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Error fetching order details" },
        { status: 500 }
      )
    );
  }
});
