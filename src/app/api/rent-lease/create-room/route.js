import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import { withAuth } from "../../../../../lib/withAuth";
import RoomCategory from "../../../../../models/RoomCategory";
import User from "../../../../../models/User";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";
import cloudinary from "../../../../../lib/cloudinary";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Create a new room listing with images
 * @route POST /api/rent-lease/add-item
 * @bodyparam {string} title - Room title
 * @bodyparam {string} propertyType - Encoded property type ID (required)
 * @bodyparam {string} roomSize - Room size
 * @bodyparam {string} price - Price
 * @bodyparam {string} description - Description (optional)
 * @bodyparam {File[]} images - Images (JPG, PNG, WEBP, AVIF)
 * @success {object} 200 - Item saved successfully
 * @error {object} 400 - Invalid input or decoding failure
 * @error {object} 500 - Image upload or database insert failed
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const config = {
  api: { bodyParser: false },
};

async function parseFormData(req) {
  const form = await req.formData();
  const title = form.get("title");
  const propertyType = form.get("propertyType");
  const roomSize = form.get("roomSize");
  const price = form.get("price");
  const frequency = form.get("frequency");
  const shortDesc = form.get("shortDesc") || "";
  const description = form.get("description") || "";
  const bedrooms = form.get("bedrooms");
  const bathrooms = form.get("bathrooms");
  const furnishedValue = form.get("furnished");
  const furnished = furnishedValue === "Yes" ? "Yes" : "No";
  const location = form.get("location");
  //const city = form.get("city");
  //const state = form.get("state");
  const amenities = form.getAll("amenities");
  const files = form.getAll("images");

  // const images = await Promise.all(
  //   files.map(async (file) => {
  //     if (typeof file === "string") return null;
  //     const buffer = Buffer.from(await file.arrayBuffer());
  //     return {
  //       buffer,
  //       filename: file.name,
  //       mime: file.type,
  //     };
  //   })
  // ).filter(Boolean);

  let images = [];

  if (Array.isArray(files)) {
    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!file || typeof file === "string" || !file.arrayBuffer) return null;

        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          buffer,
          filename: file.name,
          mime: file.type,
        };
      })
    );
    images = uploads.filter((img) => img !== null);
  }

  return {
    title,
    propertyType,
    roomSize,
    price,
    frequency,
    shortDesc,
    description,
    bedrooms,
    bathrooms,
    furnished,
    location,
    // city,
    // state,
    amenities,
    images,
  };
}

export const POST = withAuth(async function (req, user) {
  await connectDB();
  const userId = user?.id;

  let data;
  try {
    data = await parseFormData(req);
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 400 })
    );
  }

  // Fetch current location from LocationSetting
  const locationSettings = await LocationSetting.findOne({
    userId,
    isDel: false,
  });

  if (!locationSettings) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "You have to update your location first" },
        { status: 400 }
      )
    );
  }

  // Fetch currency from Country collection
  let currency = "";
  if (locationSettings.currentCountry) {
    const country = await Country.findById(locationSettings.currentCountry)
      .select("currency -_id")
      .lean();
    if (country?.currency) {
      currency = country.currency;
    }
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  const savedUrls = [];

  // const uploadDir = path.join(process.cwd(), "public/assets/images/rent-items");
  // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // for (const file of data.images) {
  //   if (!allowedTypes.includes(file.mime)) {
  //     return addCorsHeaders(
  //       NextResponse.json(
  //         { error: "Only JPG, PNG, WEBP allowed" },
  //         { status: 200 }
  //       )
  //     );
  //   }

  // const newFilename = `${Date.now()}_${file.filename}`;
  // const savePath = path.join(uploadDir, newFilename);

  //   try {
  //     fs.writeFileSync(savePath, file.buffer);
  //     savedFilenames.push(newFilename);
  //   } catch (err) {
  //     console.error("Image save failed:", err);
  //     return addCorsHeaders(
  //       NextResponse.json({ error: "Image upload failed" }, { status: 500 })
  //     );
  //   }
  // }

  for (const file of data.images) {
    if (!file || !file.mime) continue;

    if (!allowedTypes.includes(file.mime)) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Only JPG, PNG, WEBP, AVIF allowed" },
          { status: 400 }
        )
      );
    }

    try {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "room-items",
            resource_type: "image",
            public_id: `${Date.now()}_${file.filename}`,
          },
          (error, result) => {
            if (error) return reject(error);
            savedUrls.push(result.secure_url);
            resolve();
          }
        );
        stream.end(file.buffer);
      });
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return addCorsHeaders(
        NextResponse.json({ error: "Image upload failed" }, { status: 500 })
      );
    }
  }

  let decodedCategoryId;
  try {
    decodedCategoryId = decodeObjectId(data.propertyType); // ✅ decode encrypted ObjectId
  } catch (error) {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    );
  }

  // Convert amenities from strings to ObjectId array
  let amenityObjectIds = [];
  try {
    amenityObjectIds = data.amenities.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
  } catch (error) {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid Amenity ID(s)" }, { status: 400 })
    );
  }

  try {
    const newItem = await RoomItem.create({
      title: data.title,
      images: savedUrls,
      propertyType: decodedCategoryId,
      roomSize: data.roomSize,
      price: parseFloat(data.price),
      currency,
      frequency: data.frequency,
      shortDesc: data.shortDesc,
      description: data.description,
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      furnished: data.furnished,
      location: data.location,
      // city: data.city,
      // state: data.state,
      city: locationSettings.currentCity,
      country: locationSettings.currentCountry,
      amenities: amenityObjectIds,
      createdBy: userId,
    });

    return addCorsHeaders(
      NextResponse.json(
        { msg: "Successfully Saved it", item: newItem },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("DB insert failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Database insert failed" }, { status: 500 })
    );
  }
});
