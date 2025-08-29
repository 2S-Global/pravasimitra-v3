import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import cloudinary from "../../../../../lib/cloudinary";
import Product from "../../../../../models/Product";
import ProductCategory from "../../../../../models/ProductCategory";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";
import { withAuth } from "../../../../../lib/withAuth";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export const config = {
  api: { bodyParser: false },
};

async function parseFormData(req) {
  const form = await req.formData();

  const title = form.get("title");
  const category = form.get("category");
  // const city = form.get("city");
  // const state = form.get("state");
  const location = form.get("location");
  const price = form.get("price");
  const shortDesc = form.get("shortDesc") || "";
  const description = form.get("description") || "";
  const files = form.getAll("images");

  const images = (
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
    title,
    category,
    // city,
    // state,
    location,
    price,
    shortDesc,
    description,
    images,
  };
}

export const POST = withAuth(async function (req, user) {
  await connectDB();
  const userId = user?.id;

  //const baseImageUrl = `${process.env.IMAGE_URL}/product-items`;

  let data;
  try {
    data = await parseFormData(req);
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 400 })
    );
  }

  // Fetch user location settings
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

  let decodedCategoryId;
  try {
    decodedCategoryId = decodeObjectId(data.category);
  } catch (error) {
    return addCorsHeaders(
      NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    );
  }

  try {
    const newProduct = await Product.create({
      title: data.title,
      category: decodedCategoryId,
      //city: data.city,
      city: locationSettings.currentCity,
      country: locationSettings.currentCountry,
      //state: data.state,
      location: data.location,
      price: parseFloat(data.price),
      currency,
      shortDesc: data.shortDesc,
      description: data.description,
      image: savedUrls[0] || null,
      gallery: savedUrls,
      createdBy: userId,
    });

    return addCorsHeaders(
      NextResponse.json(
        {
          msg: "Product added successfully",
          product: {
            id: newProduct._id,
            title: newProduct.title,
            category: data.category,
            price: newProduct.price,
            currency: newProduct.currency,
            city: newProduct.city,
            //state: newProduct.state,
            country: newProduct.country,
            location: newProduct.location,
            shortDesc: newProduct.shortDesc,
            description: newProduct.description,
            image: newProduct.image,
            gallery: newProduct.gallery.map((img) => `${img}`),
            createdBy: userId,
          },
        },
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
