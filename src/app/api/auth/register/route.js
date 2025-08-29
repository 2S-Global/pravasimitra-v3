import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";
import MembershipPlan from "../../../../../models/MembershipPlan";
import { NextResponse } from "next/server";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import LocationSetting from "../../../../../models/LocationSetting";

// OPTIONS for CORS
export async function OPTIONS() {
  return optionsResponse();
}

// 📧 Send welcome email
const sendWelcomeEmail = async (userEmail, userName, userPassword) => {
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
    to: userEmail,
    subject: "Welcome to Pravasi Mitra",
    html: `
      <p><img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" alt="Pravasi Mitra" style="width:150px;"></p>
      <p>Hello ${userName},</p>
      <p>Welcome to Pravasi Mitra! Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <h3>Email: ${userEmail}</h3>
      <h3>Password: ${userPassword}</h3>
      <p>You can log in and update your profile anytime.</p>
      <p>Thank you for joining us!</p>
    `,
  });
};

export async function POST(req) {
  await connectDB();

  try {
    const { name, email, mobile, password, membershipId, currentCity, currentCountry, destinationCity, destinationCountry } = await req.json();

    if (!name || !email || !mobile || !password || !membershipId) {
      return addCorsHeaders(
        NextResponse.json({ msg: "All Fields Are Mandatory" })
      );
    }

    // Check if membership plan exists
    const plan = await MembershipPlan.findById(membershipId);
    if (!plan) {
      return addCorsHeaders(
        NextResponse.json({ msg: "Invalid membership plan" }, { status: 404 })
      );
    }

    // const existingUser = await User.findOne({
    //   $or: [{ email }],
    // });

    // if (existingUser && !existingUser.isDel) {
    //   return addCorsHeaders(
    //     NextResponse.json({ msg: "Email already registered" }, { status: 200 })
    //   );
    // }

    const HashedPassword = await bcrypt.hash(password, 10);

    // Set default image URL
    const defaultImageUrl =
      "https://res.cloudinary.com/dwy9i2fqt/image/upload/v1754560507/default-user_hd6lwv.png";

    // if (existingUser && existingUser.isDel) {
    //   // Update deleted user instead of creating new one
    //   existingUser.name = name;
    //   existingUser.mobile = mobile;
    //   existingUser.password = HashedPassword;
    //   existingUser.image = defaultImageUrl;
    //   existingUser.membershipId = membershipId;
    //   existingUser.isDel = false; // Reactivate the user
    //   await existingUser.save();
    // } else {
      // Create new user
      
      const newUser = new User({
        name,
        email,
        mobile,
        password: HashedPassword,
        image: defaultImageUrl,
        membershipId: membershipId,
      });

      await newUser.save();

      // Create location_settings document
    const newLocation = new LocationSetting({
      userId: newUser._id,
      currentCity,
      currentCountry,
      destinationCity,
      destinationCountry,
      isDel: false,
    });
    await newLocation.save();

      // 📧 Send welcome email
    await sendWelcomeEmail(email, name, password);
    

    return addCorsHeaders(
      NextResponse.json({ msg: "Registered Successfully" }, { status: 200 })
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return addCorsHeaders(
      NextResponse.json({ msg: "Server Error" }, { status: 500 })
    );
  }
}
