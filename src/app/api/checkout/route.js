import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Address from "../../../../models/Address";
import { withAuth } from "../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../lib/cors";
import Cart from "../../../../models/Cart";
import Order from "../../../../models/Order";
import Counter from "../../../../models/Counter";
import nodemailer from "nodemailer";
import User from "../../../../models/User";
import MarketProduct from "../../../../models/MarketProduct";

export async function OPTIONS() {
  return optionsResponse();
}

// 📧 Email Template Generator (Responsive)
function generateOrderEmail(
  recipientName,
  orderId,
  productListHtml,
  totalAmount,
  currency,
  isSeller = false,
  buyer = null
) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f5f6f8; padding: 20px;">
    <div style="max-width: 700px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden;">

    <!-- Logo -->
      <div style="text-align: center; padding: 20px; background: #ffffff;">
        <a href="" target="_blank">
          <img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" 
              alt="Pravasi Mitra" 
              style="max-width: 120px; height: auto;">
        </a>
      </div>

      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #2874f0, #3a8ef6); padding: 15px 25px; color: #fff;">
        <h2 style="margin: 0; font-size: 22px; font-weight: bold;">
          ${isSeller ? "New Order Received" : "Order Confirmation"}
        </h2>
        <p style="margin: 5px 0 0; font-size: 14px;">Order ID: <b>${orderId}</b></p>
      </div>
      
      <!-- Greeting -->
      <div style="padding: 20px;">
        <p style="font-size: 15px; color: #333;">
          Hi <b>${recipientName}</b>,<br/>
          ${
            isSeller
              ? `You’ve received a new order. Please prepare the items for dispatch.<br/>
               Buyer: <b>${buyer?.name}</b> (${buyer?.email})`
              : "Thank you for shopping with us! Your order has been placed successfully."
          }
        </p>
      </div>
      
      <!-- Order Items -->
      <div style="padding: 0 20px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
          <tbody>
            ${productListHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #fafafa; font-weight: bold;">
              <td style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
              <td style="padding: 12px; text-align: right; border-top: 2px solid #ddd; font-size: 15px;">
                ${currency}${totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9fafc; padding: 15px 20px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">${
          isSeller
            ? "Login to your dashboard to manage this order."
            : "We’ll send you another email once your items are shipped."
        }</p>
        <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} Pravasi Mitra</p>
      </div>
    </div>
  </div>
  `;
}

export const POST = withAuth(async (req, user) => {
  await connectDB();

  let data;
  try {
    data = await req.json();
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    );
  }

  const { billing, shipping, paymentMethod, transactionId } = data;

  if (!billing || !shipping || !paymentMethod) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Billing, shipping, or payment method missing" },
        { status: 400 }
      )
    );
  }

  try {
    const newAddress = new Address({
      userId: user.id,
      billing,
      shipping,
    });
    const savedAddress = await newAddress.save();

    // Fetch cart & populate products
    const cart = await Cart.findOne({ userId: user.id }).populate({
      path: "items.productId",
      model: "MarketProduct",
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return addCorsHeaders(
        NextResponse.json({ error: "Cart is empty" }, { status: 400 })
      );
    }

    let status = "pending";
    if (paymentMethod.toLowerCase() === "cash") {
      status = "pending";
    }

    let counter = await Counter.findOneAndUpdate(
      { name: "order" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create if doesn't exist
    );

    const formattedOrderId = `pravasi-${String(counter.value).padStart(
      4,
      "0"
    )}`;

    const newOrder = new Order({
      userId: user.id,
      orderId: formattedOrderId,
      addressId: savedAddress._id,
      transactionId: transactionId,
      paymentMethod,
      status,
      items: cart.items,
    });
    const savedOrder = await newOrder.save();

    // if (paymentMethod.toLowerCase() === "cash") {
    await Cart.deleteOne({ userId: user.id });
    //}

    // ------------------
    // 📧 SEND EMAILS
    // ------------------
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🛒 Buyer product list (with images)
    const buyerProductListHtml = cart.items
      .map(
        (p) => `
         <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <!-- Image -->
                  <td width="60" valign="top">
                    <img src="${
                      p.productId.images?.[0] ||
                      "https://res.cloudinary.com/dwy9i2fqt/image/upload/v1756274079/default-placeholder_js01k8.png"
                    }" 
                    alt="${p.productId.title}" 
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                  </td>
                  
                  <!-- Info -->
                  <td style="padding-left: 10px; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: bold; color: #333;">${
                      p.productId.title
                    }</div>
                    <div style="font-size: 13px; color: #666;">Qty: ${
                      p.quantity
                    }</div>
                    <div style="font-size: 13px; color: #666;">Price: ${
                      p.currency
                    }${p.price}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `
      )
      .join("");

    const totalAmountBuyer = cart.items.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const currency = cart.items[0]?.currency || "£";

    // 1️⃣ Email Buyer
    await transporter.sendMail({
      from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - ${formattedOrderId}`,
      html: generateOrderEmail(
        user.name,
        formattedOrderId,
        buyerProductListHtml,
        totalAmountBuyer,
        currency,
        false
      ),
    });

    // 2️⃣ Email Sellers (only their own products)
    const sellerIds = [
      ...new Set(cart.items.map((item) => item.productId.createdBy.toString())),
    ];

    const sellers = await User.find({ _id: { $in: sellerIds } });

    await Promise.all(
      sellers.map((seller) => {
        const sellerProducts = cart.items.filter(
          (item) =>
            item.productId.createdBy.toString() === seller._id.toString()
        );

        const productListHtml = sellerProducts
          .map(
            (p) => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <!-- Image -->
                      <td width="60" valign="top">
                        <img src="${
                          p.productId.images?.[0] ||
                          "https://res.cloudinary.com/dwy9i2fqt/image/upload/v1756274079/default-placeholder_js01k8.png"
                        }" 
                        alt="${p.productId.title}" 
                        style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                      </td>
                      
                      <!-- Info -->
                      <td style="padding-left: 10px; vertical-align: top;">
                        <div style="font-size: 14px; font-weight: bold; color: #333;">${p.productId.title}</div>
                        <div style="font-size: 13px; color: #666;">Qty: ${p.quantity}</div>
                        <div style="font-size: 13px; color: #666;">Price: ${p.currency}${p.price}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `
          )
          .join("");

        const totalAmountSeller = sellerProducts.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );
        const sellerCurrency = sellerProducts[0]?.currency || "£";

        return transporter.sendMail({
          from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
          to: seller.email,
          subject: `New Order Received - ${formattedOrderId}`,
          html: generateOrderEmail(
            seller.name,
            formattedOrderId,
            productListHtml,
            totalAmountSeller,
            sellerCurrency,
            true,
            user
          ),
        });
      })
    );

    return addCorsHeaders(
      NextResponse.json(
        {
          message: "Order created successfully",
          id: savedOrder._id,
          orderId: savedOrder.orderId,
          addressId: savedAddress._id,
          order: savedOrder,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Error saving address or order:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});
