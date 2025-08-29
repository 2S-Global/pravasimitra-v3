import { withAuth } from "../../../../../lib/withAuth";
import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";
import City from "../../../../../models/City";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

// CORS Preflight
export async function OPTIONS() {
  return optionsResponse();
}

// Helper to format dates to dd-mm-yyyy
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
}

// Helper: Convert dd-mm-yyyy or dd/mm/yyyy safely to Date object
function convertToDate(str) {
  if (!str || typeof str !== "string") return undefined;

  const separator = str.includes("/") ? "/" : "-";
  const [dd, mm, yyyy] = str.split(separator);

  if (!dd || !mm || !yyyy) return undefined;

  const parsed = new Date(`${yyyy}-${mm}-${dd}`);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

// ======== Fetch user profile (GET) ================
export const GET = withAuth(async (req, user) => {
  try {
    await connectDB();
    const userId = user.id;

    const existingUser = await User.findById(userId).select("-__v").lean();
    if (!existingUser) {
      return addCorsHeaders(
        NextResponse.json({ error: "User not found" }, { status: 404 })
      );
    }

    //const baseImageUrl = `${process.env.IMAGE_URL}/profile-img`;

    const imageUrl = existingUser.image
      ? //`${baseImageUrl}/${existingUser.image}`
        existingUser.image
      : `${process.env.IMAGE_URL}/default-user.png`;

    // // Build the user object with new image path
    // const userToReturn = {
    //   ...existingUser,
    //   image: imageUrl,
    // };

    // Fetch active location for this user
    const activeLocation = await LocationSetting.findOne({
      userId: userId,
      isDel: false
    })
      .populate("currentCountry", "name")
      .populate("currentCity", "name")
      .populate("destinationCountry", "name")
      .populate("destinationCity", "name")
      .lean();

    // Format date fields
    const userToReturn = {
      ...existingUser,
      image: imageUrl,
      dateOfBirth: formatDate(existingUser.dateOfBirth),
      passportExpiry: formatDate(existingUser.passportExpiry),
      visaExpiry: formatDate(existingUser.visaExpiry),
      location: activeLocation || null,
    };

    return addCorsHeaders(
      NextResponse.json({
        msg: "User fetched successfully",
        user: userToReturn,
      })
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
});

//=========== Update user profile (PUT) ============
export const PUT = withAuth(async (req, user) => {
  try {
    await connectDB();
    const userId = user.id;
    const body = await req.json();

    // Cleanly parse each date field
    const parsedDOB = convertToDate(body.dateOfBirth);
    const parsedPassport = convertToDate(body.passportExpiry);
    const parsedVisa = convertToDate(body.visaExpiry);

    if (parsedDOB) body.dateOfBirth = parsedDOB;
    else delete body.dateOfBirth;

    if (parsedPassport) body.passportExpiry = parsedPassport;
    else delete body.passportExpiry;

    if (parsedVisa) body.visaExpiry = parsedVisa;
    else delete body.visaExpiry;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: body },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .lean();

    if (!updatedUser) {
      return addCorsHeaders(
        NextResponse.json({ error: "User not found" }, { status: 404 })
      );
    }

    // Format date fields before sending response
    const userToReturn = {
      ...updatedUser,
      dateOfBirth: formatDate(updatedUser.dateOfBirth),
      passportExpiry: formatDate(updatedUser.passportExpiry),
      visaExpiry: formatDate(updatedUser.visaExpiry),
    };

    return addCorsHeaders(
      NextResponse.json({
        msg: "User updated successfully",
        user: userToReturn,
      })
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
});
