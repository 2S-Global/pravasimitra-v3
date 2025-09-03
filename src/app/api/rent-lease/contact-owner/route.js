import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import RoomContact from "../../../../../models/RoomContact";
import RoomItem from "../../../../../models/Room";
import User from "../../../../../models/User";
import nodemailer from "nodemailer";
import { withAuth } from "../../../../../lib/withAuth";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import { decodeObjectId } from "../../../../../lib/idCodec";

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

  let { roomId, ownerId } = data;

  roomId = decodeObjectId(roomId);
  const userId = authUser.id;

  if (!roomId || !ownerId) {
    return addCorsHeaders(
      NextResponse.json({ error: "Missing fields" }, { status: 400 })
    );
  }

  try {
    const [user, owner, room] = await Promise.all([
      User.findById(userId),
      User.findById(ownerId),
      RoomItem.findById(roomId),
    ]);

    if (!user || !owner || !room) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid references" }, { status: 404 })
      );
    }

    // ✅ Check if already contacted for the same room
    const existingContact = await RoomContact.findOne({
      userId,
      ownerId,
      roomId,
    });

    if (existingContact) {
      return addCorsHeaders(
        NextResponse.json(
          {
            msg: "You have already contacted the owner for this room.",
          },
          { status: 200 }
        )
      );
    }

    // ✅ Create new contact
    await RoomContact.create({ userId, ownerId, roomId });

    // Send email to owner
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
      to: owner.email,
      subject: `Rental Inquiry: ${room.title}`,
      html: `
        <p><img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" alt="Pravasi Mitra" style="width:150px;"></p>
        <br>
        <p>Hello ${owner.name},</p>
        <p>${user.name} is interested in your room: <b>${room.title}</b>.</p>
        <p>You can reply at: <a href="mailto:${user.email}">${user.email}</a></p>
        <p>Thank you for using Pravasi Mitra.</p>
      `,
    });

     // 📩 Send mail to Buyer
    await transporter.sendMail({
      from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your inquiry for ${room.title}`,
      html: `
      <p><img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" alt="Pravasi Mitra" style="width:150px;"></p>
      <br>
      <p>Hello ${user.name},</p>
      <p>Your inquiry for <b>${room.title}</b> has been sent to ${owner.name}.</p>
      <p>Owner's contact: <a href="mailto:${owner.email}">${owner.email}</a></p>
      <p>Thank you for using Pravasi Mitra.</p>
    `,
    });

    return addCorsHeaders(
      NextResponse.json(
        { msg: "You’ve successfully reached out to the owner." },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Contact Owner Error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});
