import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import MarketProduct from "../../../../../models/MarketProduct";
import { withAuth } from "../../../../../lib/withAuth";
import MarketCategory from "../../../../../models/MarketCategory";
import User from "../../../../../models/User";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import cloudinary from "../../../../../lib/cloudinary";

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
  const category = form.get("category");
  const price = form.get("price");
  const description = form.get("description") || "";
  const files = form.getAll("images");
  const quantity = form.get("quantity");
  const unit = form.get("unit");
  // const city = form.get("city");
  const state = form.get("state");
  const location = form.get("location");

  const existingImageRaw = form.get("existingImageRaw");

  let existingImages = [];
  if (existingImageRaw) {
    try {
      existingImages = JSON.parse(existingImageRaw);
    } catch {
      existingImages = existingImageRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

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
  // );

  const newImages = await Promise.all(
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
    category,
    price,
    description,
    quantity,
    unit,
    // city,
    state,
    location,
    existingImages,
    newImages: newImages.filter(Boolean),
  };
}

/**
 * @description Handle single MarketProduct item fetch and update (only for authenticated users)
 *
 * @route GET /api/marketplace/edit-product
 * @queryparam {string} id - Encoded MarketProduct ID
 * @success {object} 200 - Returns the MarketProduct data
 * @error {object} 400 - Missing or invalid ID
 * @error {object} 404 - Item not found or unauthorized
 * @error {object} 500 - Server error
 *
 * @route PATCH /api/marketplace/edit-product
 * @formdata {string} id - Encoded MarketProduct ID
 * @formdata {string} title - Product title
 * @formdata {string} category - Encoded category ID
 * @formdata {number} price - Product price
 * @formdata {string} description - Product description (optional)s
 * @formdata {string} existingImageRaw - JSON array or comma-separated list of existing image filenames
 * @formdata {File[]} images - New image files to upload
 * @success {object} 200 - Item updated successfully
 * @error {object} 400 - Invalid form data or ID
 * @error {object} 404 - Item not found or unauthorized
 * @error {object} 500 - Image upload or database update failure
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
    const item = await MarketProduct.findOne({ _id: id, createdBy: user.id })
      .populate("category", "name")
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
    category,
    price,
    description,
    quantity,
    unit,
    // city,
    state,
    location,
    existingImages,
    newImages,
  } = data;

  // console.log(data);

  if (!id) {
    return addCorsHeaders(
      NextResponse.json({ msg: "Missing item Id" }, { status: 400 })
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

  let decodedCategoryId;
  try {
    decodedCategoryId = decodeObjectId(category);
  } catch {
    return addCorsHeaders(
      NextResponse.json({ msg: "Invalid encoded category ID" }, { status: 400 })
    );
  }

  // Get the existing product
  const existingProduct = await MarketProduct.findOne({
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

  const savedUrls = [...existingImages];

  // const uploadDir = path.join(
  //   process.cwd(),
  //   "public/assets/images/e-marketplace"
  // );
  // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  for (const file of newImages) {
    if (!allowedTypes.includes(file.mime)) {
      return addCorsHeaders(
        NextResponse.json(
          { msg: "Only JPG, PNG, AVIF, WEBP Allowed" },
          { status: 400 }
        )
      );
    }
    // const newFilename = `${Date.now()}_${file.filename}`;
    // const savePath = path.join(uploadDir, newFilename);

  //   try {
  //     fs.writeFileSync(savePath, file.buffer);
  //     savedFilenames.push(newFilename);
  //   } catch (err) {
  //     return addCorsHeaders(
  //       NextResponse.json({ error: "Image upload failed" }, { status: 500 })
  //     );
  //   }
  // }

  try {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "e-marketplace",
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

  // Build updated product data using spread
  const updatedData = {
    ...existingProduct.toObject(), // start with old values
    title,
    category: decodedCategoryId,
    price: parseFloat(price),
    description,
    quantity: parseInt(quantity, 10),
    unit,
    state,
    location,
    images: savedUrls,
    city: existingProduct.city, // keep original city
    country: existingProduct.country, // keep original country
    currency: existingProduct.currency, // keep original currency
  };

  try {
    const updated = await MarketProduct.findByIdAndUpdate(
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
      NextResponse.json({ msg: "Update failed" }, { status: 500 })
    );
  }
});
