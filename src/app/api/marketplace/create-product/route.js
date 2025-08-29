import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import MarketProduct from "../../../../../models/MarketProduct";
import MarketCategory from "../../../../../models/MarketCategory";
import LocationSetting from "../../../../../models/LocationSetting";
import Country from "../../../../../models/Country";
import { withAuth } from "../../../../../lib/withAuth";
import { decodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import cloudinary from "../../../../../lib/cloudinary";

// Handle preflight CORS
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
  const location = form.get("location") || "";
  // const ingredients = form.get("ingredients") || "";
  const price = form.get("price");
  // const shortDesc = form.get("shortDesc") || "";
  const description = form.get("description") || "";
  const quantity = form.get("quantity");
  const unit = form.get("unit");
  const files = form.getAll("images");

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
    title,
    category,
    //city,
    //state,
    location,
    //ingredients,
    price,
    // shortDesc,
    description,
    quantity,
    unit,
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
  const uploadedImageUrls = [];

  // const uploadDir = path.join(
  //   process.cwd(),
  //   "public/assets/images/e-marketplace"
  // );
  // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  for (const file of data.images) {
    if (!file || !allowedTypes.includes(file.mime)) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Only JPG, JPEG, PNG, WEBP allowed" },
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
    //     console.error("Image save failed:", err);
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
            uploadedImageUrls.push(result.secure_url);
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
    const newItem = await MarketProduct.create({
      title: data.title,
      images: uploadedImageUrls,
      category: decodedCategoryId,
      city: locationSettings.currentCity,
      country: locationSettings.currentCountry,
      //state: data.state,
      location: data.location,
      //ingredients: data.ingredients,
      price: parseFloat(data.price),
      currency,
      // shortDesc: data.shortDesc,
      description: data.description,
      quantity: parseInt(data.quantity, 10),
      unit: data.unit,
      createdBy: userId,
    });

    return addCorsHeaders(
      NextResponse.json(
        { msg: "Product created successfully", item: newItem },
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
