import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
import ProductCategory from "../../../../../models/ProductCategory";
import { withAuth } from "../../../../../lib/withAuth";
import { decodeObjectId } from "../../../../../lib/idCodec";
import cloudinary from "../../../../../lib/cloudinary";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export const config = {
  api: { bodyParser: false },
};

async function parseFormData(req) {
  const form = await req.formData();

  const id = form.get("id");
  const title = form.get("title");
  const category = form.get("category");
  // const city = form.get("city");
  const state = form.get("state");
  const location = form.get("location");
  const price = form.get("price");
  const shortDesc = form.get("shortDesc") || "";
  const description = form.get("description") || "";
  const files = form.getAll("images");
  const existingImageRaw = form.get("existingImageRaw");
  const existingImages = existingImageRaw ? JSON.parse(existingImageRaw) : [];

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

  const newImages = (
    await Promise.all(
      files.map(async (file) => {
        if (typeof file === "string") return null;
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          buffer,
          filename: file.name,
          mime: file.type,
        };
      })
    )
  ).filter(Boolean);

  return {
    id,
    title,
    category,
    // city,
    state,
    location,
    price,
    shortDesc,
    description,
    //newImages: images.filter(Boolean),
    newImages,
    existingImages,
  };
}

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
    const product = await Product.findOne({ _id: id, createdBy: user.id })
      .populate("category", "name")
      .lean();

    if (!product) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Item not found or unauthorized" },
          { status: 404 }
        )
      );
    }

    return addCorsHeaders(
      NextResponse.json({ item: product }, { status: 200 })
    );
  } catch (err) {
    console.error("GET single product error:", err);
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
    // city,
    state,
    location,
    price,
    shortDesc,
    description,
    newImages,
    existingImages,
  } = data;

  if (!id) {
    return addCorsHeaders(
      NextResponse.json({ msg: "Missing product ID" }, { status: 400 })
    );
  }

  let decodedId, decodedCategoryId;
  try {
    decodedId = decodeObjectId(id);
    decodedCategoryId = decodeObjectId(category);
  } catch {
    return addCorsHeaders(
      NextResponse.json({ msg: "Invalid encoded ID" }, { status: 400 })
    );
  }

  // Get the existing product
  const existingProduct = await Product.findOne({
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

  // const uploadDir = path.join(process.cwd(), "public/assets/images/product");
  // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  for (const file of newImages) {
    if (!file || !file.mime || !allowedTypes.includes(file.mime)) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Only JPG, PNG, WEBP, AVIF allowed" },
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
    //     return addCorsHeaders(NextResponse.json(
    //       { error: "Image upload failed" },
    //       { status: 500 }
    //     ));
    //   }
    // }

    try {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "product-items",
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
  ...existingProduct.toObject(), // keep all old values
  title,
  category: decodedCategoryId,
  price: parseFloat(price),
  description,
  state,
  location,
  image: savedUrls[0] || existingProduct.image,
  gallery: savedUrls.length ? savedUrls : existingProduct.gallery,
  city: existingProduct.city,       //  keep original city
  country: existingProduct.country, //  keep original country
  currency: existingProduct.currency, // keep original currency
};


  try {
    const updated = await Product.findOneAndUpdate(
      { _id: decodedId, createdBy: user.id },
      updatedData,
      { new: true }
    );

    if (!updated) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Product not found or unauthorized" },
          { status: 404 }
        )
      );
    }

    return addCorsHeaders(
      NextResponse.json(
        { msg: "Product updated successfully", item: updated },
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
