import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import ProductContact from "../../../../../models/ProductContact";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";
import nodemailer from "nodemailer";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { decodeObjectId, encodeObjectId } from "../../../../../lib/idCodec";

export async function OPTIONS() {
  return optionsResponse();
}

export const POST = withAuth(async (req, authUser) => {
  await connectDB();
  let data;

  try {
    data = await req.json();
  } catch {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    );
  }

  let { productId, sellerId } = data;
  productId = decodeObjectId(productId);
  const userId = authUser.id;

  if (!productId || !sellerId) {
    return addCorsHeaders(
      NextResponse.json({ error: "Missing fields" }, { status: 400 })
    );
  }

  try {
    const [user, seller, product] = await Promise.all([
      User.findById(userId),
      User.findById(sellerId),
      Product.findById(productId),
    ]);

    if (!user || !seller || !product) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid references" }, { status: 404 })
      );
    }

    // 🔍 Check if user already contacted seller for this product
    const existingContact = await ProductContact.findOne({
      userId,
      sellerId,
      productId,
    });

    if (existingContact) {
      return addCorsHeaders(
        NextResponse.json(
          {
            msg: "You have already contacted the seller for this product.",
          },
          { status: 200 }
        )
      );
    }

    // ✅ If no existing contact, create new record
    await ProductContact.create({ userId, sellerId, productId });

    //Send email to seller
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: `Inquiry: ${product.title}`,
      html: `
        <p><img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" alt="Pravasi Mitra" style="width:150px;"></p>
        <br>
        <p>Hello ${seller.name},</p>
        <p>${user.name} is interested in your product <b>${product.title}</b>.</p>
        <p>You can reply at: <a href="mailto:${user.email}">${user.email}</a></p>
        <p>Thank you for using Pravasi Mitra.</p>
      `,
    });

    // 📩 Send mail to Buyer
    await transporter.sendMail({
      from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your inquiry for ${product.title}`,
      html: `
      <p><img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" alt="Pravasi Mitra" style="width:150px;"></p>
      <br>
      <p>Hello ${user.name},</p>
      <p>Your inquiry for <b>${product.title}</b> has been sent to ${seller.name}.</p>
      <p>Seller's contact: <a href="mailto:${seller.email}">${seller.email}</a></p>
      <p>Thank you for using Pravasi Mitra.</p>
    `,
    });

    return addCorsHeaders(
      NextResponse.json(
        { msg: "You’ve successfully reached out to the seller." },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Contact error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});
