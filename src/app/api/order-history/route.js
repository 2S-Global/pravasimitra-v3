import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { withAuth } from "../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import Order from "../../../../models/Order";
import MarketProduct from "../../../../models/MarketProduct";
import Address from "../../../../models/Address";
import { encodeObjectId } from "../../../../lib/idCodec";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
  await connectDB();

  try {
    // ✅ Fetch orders with address populated
    const orders = await Order.find({ userId: user.id })
      .populate("addressId")
      .lean();

    if (!orders.length) {
      return addCorsHeaders(
        NextResponse.json({ error: "No orders found" }, { status: 404 })
      );
    }

    // ✅ Collect unique product IDs from all items
    const productIds = [
      ...new Set(
        orders.flatMap(order =>
          order.items.map(item => item.productId?.toString())
        )
      ),
    ];

    // ✅ Fetch products in one go
    const products = await MarketProduct.find({ _id: { $in: productIds } }).lean();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

    // ✅ Build response: encode IDs, attach product details
    const responseOrders = orders.map(order => ({
      ...order,
      _id: encodeObjectId(order._id),
      addressId: order.addressId
        ? {
            ...order.addressId,
            _id: encodeObjectId(order.addressId._id),
          }
        : null,
      items: order.items.map(item => {
        const rawId = item.productId?.toString();
       
        const product = productMap[rawId];
//  console.log("Product ID:", product);
        return {
          ...item,
          _id: encodeObjectId(item._id),
          productId: encodeObjectId(item.productId),
          productDetails: product
            ? {
                _id: encodeObjectId(product._id),
                title: product.title,
                price: product.price,
                images: product.images,
                description: product.description,
              }
            : null,
        };
      }),
    }));

    return addCorsHeaders(
      NextResponse.json({ orders: responseOrders }, { status: 200 })
    );

  } catch (error) {
    console.error("Error fetching orders:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
    );
  }
});
