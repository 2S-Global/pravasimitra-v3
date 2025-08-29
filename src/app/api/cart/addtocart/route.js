import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import Cart from "../../../../../models/Cart";
import { withAuth } from "../../../../../lib/withAuth";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import MarketProduct from "../../../../../models/MarketProduct";
import MarketCategory from "../../../../../models/MarketCategory";

export async function OPTIONS() {
  return optionsResponse();
}
// Helper to round to 2 decimal places
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

  let { productId, quantity, price, sellerId } = data;

  productId = decodeObjectId(productId);

  if (!productId || !quantity || !price) {
    return addCorsHeaders(
      NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    );
  }

  try {
    // Fetch product to get currency
    const product = await MarketProduct.findById(productId);
    if (!product) {
      return addCorsHeaders(
        NextResponse.json({ error: "Product not found" }, { status: 404 })
      );
    }

    const currency = product.currency; // get from product
    let currencyName = null;
    if ( currency === "£"){
      currencyName = "gbp";
    }
    else if (currency === "৳") {
      currencyName = "bdt";
    }
    else if (currency === "₹") {
      currencyName = "inr";
    } else {
      currencyName = "usd";
    }
    const roundedPrice = roundTwo(price);

    let cart = await Cart.findOne({ userId: user.id });

    // const roundedPrice = roundTwo(price);

    if (!cart) {
      cart = new Cart({
        userId: user.id,
        items: [
          {
            productId,
            quantity,
            price: roundedPrice,
            sellerId,
            currency,
            currencyName,
          },
        ],
        currency,
        currencyName,
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = roundedPrice;
        existingItem.currency = currency;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: roundedPrice,
          sellerId,
          currency,
          currencyName,
        });
      }
    }

    await cart.save();

    return addCorsHeaders(
      NextResponse.json({ message: "Added to cart", cart }, { status: 200 })
    );
  } catch (err) {
    console.error("Add to cart error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});

//======== Fetch Cart details (GET) ================
export const GET = withAuth(async (req, user) => {
  await connectDB();

  if (!user?.id) {
    return addCorsHeaders(
      NextResponse.json({ error: "Authentication required" }, { status: 401 })
    );
  }

  try {
    const cart = await Cart.findOne({ userId: user.id }).populate({
      path: "items.productId",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!cart) {
      return addCorsHeaders(
        NextResponse.json(
          { message: "Cart is empty", items: [] },
          { status: 200 }
        )
      );
    }

    // const formattedItems = cart.items.map((item) => ({
    //   productId: item.productId._id,
    //   product: {
    //     title: item.productId.title,
    //     images: item.productId.images,
    //     price: item.productId.price,
    //     description: item.productId.description,
    //     category: item.productId.category,
    //   },
    //   quantity: item.quantity,
    //   itemPrice: item.price,
    //   subtotal: item.price * item.quantity,
    // }));

    const formattedItems = cart.items.map((item) => {
      const itemPrice = roundTwo(item.price);
      const subtotal = roundTwo(itemPrice * item.quantity);

      return {
        productId: item.productId._id,
        product: {
          title: item.productId.title,
          images: item.productId.images,
          price: roundTwo(item.productId.price),
          description: item.productId.description,
          category: item.productId.category,
        },
        quantity: item.quantity,
        itemPrice,
        subtotal,
        currency: item.currency,
        currencyName: item.currencyName,
      };
    });

    // Calculate total
    const cartTotal = formattedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const roundedCartTotal = Math.round(cartTotal * 100) / 100;
    const formattedCart = {
      userId: cart.userId,
      items: formattedItems,
      cartTotal: roundedCartTotal,
      currency: formattedItems[0]?.currency,
      currencyName: formattedItems[0]?.currencyName,
    };

    return addCorsHeaders(
      NextResponse.json({ cart: formattedCart }, { status: 200 })
    );
  } catch (err) {
    console.error("Get cart error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});
