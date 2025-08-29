import { NextResponse } from "next/server";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import { withAuth } from "../../../../../lib/withAuth";
import RoomCategory from "../../../../../models/RoomCategory";
import User from "../../../../../models/User";
import cloudinary from "../../../../../lib/cloudinary";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(req) {
  const form = await req.formData();

  const id = form.get("id");
  const title = form.get("title");
  const propertyType = form.get("propertyType");
  const roomSize = form.get("roomSize");
  const price = form.get("price");
  const frequency = form.get("frequency");
  const shortDesc = form.get("shortDesc") || "";
  const description = form.get("description");
  const bedrooms = form.get("bedrooms");
  const bathrooms = form.get("bathrooms");
  const furnishedValue = form.get("furnished");
  const furnished = furnishedValue === "Yes" ? "Yes" : "No";
  const location = form.get("location");
  // const city = form.get("city");
  const state = form.get("state");
  const amenities = form.getAll("amenities");
  const files = form.getAll("images");
  const existingImageRaw = form.get("existingImageRaw");
  const existingImages = existingImageRaw ? JSON.parse(existingImageRaw) : [];

  const images = await Promise.all(
    files.map(async (file) => {
      if (typeof file === "string") return null;
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        buffer,
        filename: file.name,
        mime: file.type,
      };
    })
  );

  return {
    id,
    title,
    propertyType,
    roomSize,
    shortDesc,
    price,
    frequency,
    description,
    bedrooms,
    bathrooms,
    furnished,
    location,
    // city,
    state,
    amenities,
    newImages: images.filter(Boolean),
    existingImages,
  };
}

/**
 * @description Get a single RoomItem by its encoded ID (only if created by the authenticated user)
 * @route GET /api/rent-lease/edit-item
 * @queryparam {string} id - Encoded RoomItem ID
 * @success {object} 200 - Returns the RoomItem data
 * @error {object} 400 - Missing or invalid ID
 * @error {object} 404 - Item not found or unauthorized
 * @error {object} 500 - Server error
 */

export const GET = withAuth(async (req, user) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  let id = searchParams.get("id");

  if (!id)
    return addCorsHeaders(
      NextResponse.json({ error: "Missing item ID" }, { status: 400 })
    );

  try {
    id = decodeObjectId(id);
  } catch {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid encoded ID" }, { status: 400 })
    );
  }

  try {
    const item = await RoomItem.findOne({ _id: id, createdBy: user.id })
      .populate("propertyType", "name")
      .populate("createdBy", "name")
      .lean();

    if (!item) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Item not found or unauthorized" },
          { status: 404 }
        )
      );
    }

    return addCorsHeaders(NextResponse.json({ item }, { status: 200 }));
  } catch (err) {
    console.error("GET single item error:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
    );
  }
});

/**
 * @description Update an existing RoomItem (including replacing/adding images)
 * @route PATCH /api/rent-lease/edit-item
 * @body {multipart/form-data} - Fields: id, title, propertyType, roomSize, price, description, images[], existingImageRaw (JSON array or comma-separated string)
 * @success {object} 200 - Item updated successfully with new image and field data
 * @error {object} 400 - Invalid form data or encoded ID
 * @error {object} 404 - Item not found or unauthorized
 * @error {object} 500 - Server error (e.g. file system or database issues)
 */

export const PATCH = withAuth(async (req, user) => {
  await connectDB();

  let data;
  try {
    data = await parseFormData(req);
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ msg: "Invalid Form Data" }, { status: 400 })
    );
  }

  const {
    id,
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
    state,
    amenities,
    newImages,
    existingImages,
  } = data;

  if (!id) {
    return addCorsHeaders(
      NextResponse.json({ msg: "Missing item Id" }, { status: 200 })
    );
  }

  let decodedId;
  try {
    decodedId = decodeObjectId(id);
  } catch {
    return addCorsHeaders(
      NextResponse.json({ msg: "Invalid encoded ID" }, { status: 400 })
    );
  }

  // const amenityObjectIds = amenities.map(
  //   (id) => new mongoose.Types.ObjectId(id)
  // );

  // ✅ Decode and convert propertyType
  let decodedPropertyType;
  try {
    decodedPropertyType = new mongoose.Types.ObjectId(
      decodeObjectId(propertyType)
    );
  } catch {
    return addCorsHeaders(
      NextResponse.json({ msg: "Invalid propertyType ID" }, { status: 400 })
    );
  }

  // ✅ Decode and Convert amenity IDs to ObjectIds
  let amenityObjectIds = [];
  try {
    amenityObjectIds = amenities.map((id) => new mongoose.Types.ObjectId(id));
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ msg: "Invalid amenity ID(s)" }, { status: 400 })
    );
  }

  // Get the existing product
    const existingProduct = await RoomItem.findOne({
      _id: decodedId,
      createdBy: user.id,
    });
  
    if (!existingProduct) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Item not found or unauthorized" },
          { status: 404 }
        )
      );
    }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];
  const savedFilenames = [...existingImages];

  // const uploadDir = path.join(process.cwd(), "public/assets/images/rent-items");
  // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // for (const file of newImages) {
  //   if (!allowedTypes.includes(file.mime)) {
  //     return addCorsHeaders(
  //       NextResponse.json(
  //         { msg: "Only JPG,PNG,AVIF,WEBP Allowed" },
  //         { status: 200 }
  //       )
  //     );
  //   }
  //   const newFilename = `${Date.now()}_${file.filename}`;
  //   const savePath = path.join(uploadDir, newFilename);

  //   try {
  //     fs.writeFileSync(savePath, file.buffer);
  //     savedFilenames.push(newFilename);
  //   } catch (err) {
  //     return addCorsHeaders(
  //       NextResponse.json({ error: "Image upload failed" }, { status: 500 })
  //     );
  //   }
  // }

  // ✅ Cloudinary image uploads
  for (const file of newImages) {
    if (!file || !file.mime || !allowedTypes.includes(file.mime)) {
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
            savedFilenames.push(result.secure_url); // for Cloudinary URLs
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

  //   try {
  //     const updated = await RoomItem.findByIdAndUpdate(
  //       { _id: decodedId, createdBy: user.id },
  //       {
  //         $set: {
  //           title,
  //           propertyType,
  //           roomSize,
  //           price: parseFloat(price),
  //           shortDesc,
  //           description,
  //           bedrooms: parseInt(bedrooms, 10),
  //           bathrooms: parseInt(bathrooms, 10),
  //           furnished,
  //           location,
  //           city,
  //           state,
  //           amenities: amenityObjectIds,
  //           frequency,
  //           images: savedFilenames,
  //         },
  //       },
  //       { new: true }
  //     );

  // Build updated product data using spread
  const updatedData = {
    ...existingProduct.toObject(), // start with old values
    title,
    propertyType: decodedPropertyType,
    roomSize,
    price: parseFloat(price),
    shortDesc,
    description,
    bedrooms: parseInt(bedrooms, 10),
    bathrooms: parseInt(bathrooms, 10),
    furnished,
    location,
    state,
    frequency,
    amenities: amenityObjectIds,
    images: savedFilenames,
    city: existingProduct.city, // keep original city
    country: existingProduct.country, // keep original country
    currency: existingProduct.currency, // keep original currency
  };

  // ✅ usage of findOneAndUpdate with both _id and createdBy
  try {
    const updated = await RoomItem.findOneAndUpdate(
      { _id: decodedId, createdBy: user.id },
      updatedData,
      { new: true }
    );

    if (!updated) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Item not found or unauthorized" },
          { status: 404 }
        )
      );
    }
    return addCorsHeaders(
      NextResponse.json(
        { msg: "Item updated successfully", item: updated },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Update failed:", err);
    return addCorsHeaders(
      NextResponse.json(
        { msg: "Update failed", error: err.message },
        { status: 500 }
      )
    );
  }
});
