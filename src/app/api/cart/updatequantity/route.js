import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Cart from "../../../../../models/Cart";
import MarketProduct from "../../../../../models/MarketProduct";
import { withAuth } from "../../../../../lib/withAuth";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// Helper function to round to 2 decimals
const roundTwo = (num) => Math.round(num * 100) / 100;

export const POST = withAuth(async (req, user) => {
  await connectDB();

  if (!user?.id) {
    return addCorsHeaders(
      NextResponse.json({ error: "Authentication required" }, { status: 401 })
    );
  }

  let data;
  try {
    data = await req.json();
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    );
  }

  let { productId, delta } = data;

  if (!productId || typeof delta !== "number") {
    return addCorsHeaders(
      NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    );
  }

  try {
    let cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      return addCorsHeaders(
        NextResponse.json({ error: "Cart not found" }, { status: 404 })
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return addCorsHeaders(
        NextResponse.json({ error: "Item not in cart" }, { status: 404 })
      );
    }

    // Increment or decrement quantity
    cart.items[itemIndex].quantity = delta;

    // if (cart.items[itemIndex].quantity <= 0) {
    //   // Remove item if quantity is now zero or negative
    //   cart.items.splice(itemIndex, 1);
    // }

    // Ensure price is stored with only 2 decimals
    cart.items[itemIndex].price = roundTwo(cart.items[itemIndex].price);

    await cart.save();

    // Populate updated cart details for response
    await cart.populate({
      path: "items.productId",
      populate: { path: "category" },
    });

    // Calculate formatted items with subtotals
    const formattedItems = cart.items.map((item) => {
      const unitPrice = roundTwo(item.price);
      const quantity = item.quantity;
      const subtotal = roundTwo(unitPrice * quantity);

      return {
        productId: item.productId._id,
        product: {
          title: item.productId.title,
          // images: item.productId.images.map(
          //   (img) => `${process.env.IMAGE_URL}/e-marketplace/${img}`
          // ),
          images: item.productId.images,
          price: roundTwo(item.productId.price),
          description: item.productId.description,
          category: item.productId.category,
        },
        quantity,
        itemPrice: unitPrice,
        subtotal,
        currency: item.currency,
        currencyName: item.currencyName,
      };
    });

    // Calculate cart total
    // const cartTotal = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

    // const responseCart = {
    //   userId: cart.userId,
    //   items: formattedItems,
    //   cartTotal
    // };

    let cartTotal = formattedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    cartTotal = roundTwo(cartTotal);

    const responseCart = {
      userId: cart.userId,
      items: formattedItems,
      cartTotal: cartTotal,
      currency: formattedItems[0]?.currency,
      currencyName: formattedItems[0]?.currencyName,
      
    };

    return addCorsHeaders(
      NextResponse.json(
        { message: "Cart updated", cart: responseCart },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Update cart quantity error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});
