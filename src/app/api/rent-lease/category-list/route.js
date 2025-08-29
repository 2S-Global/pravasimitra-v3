import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import RoomCategory from "../../../../../models/RoomCategory";
import User from "../../../../../models/User";
import { encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Get all room categories from the database
 * @route GET /api/rent-lease/category-list
 * @success {object} 200 - Room Categories fetched successfully
 * @error {object} 500 - Failed to fetch categories
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = async (req) => {
  await connectDB();

  try {
    const categoryList = await RoomCategory.find({ isDel: false }).lean();

    // const imageBaseUrl = `${process.env.IMAGE_URL}/room-category`;

    // console.log(categoryList);

    const categories = categoryList.map((cat) => ({
      id: encodeObjectId(cat._id),
      name: cat.name,
      // icon: cat.icon ? `${imageBaseUrl}/${cat.icon}` : "",
      icon: cat.icon || "",
      image: cat.image
        ? `${process.env.IMAGE_URL}/room-category/${cat.image}`
        : "",
    }));

    if (!categories || categories.length === 0) {
      return addCorsHeaders(
        NextResponse.json(
          { msg: "No Items Found", categories: [] },
          { status: 200 }
        )
      );
    }

    return addCorsHeaders(
      NextResponse.json(
        { msg: "Categories fetched successfully", categories: categories },
        { status: 200 }
      )
    );
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      )
    );
  }
};
