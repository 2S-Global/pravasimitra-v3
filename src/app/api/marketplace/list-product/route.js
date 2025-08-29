import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {connectDB} from "../../../../../lib/db";
import MarketProduct from "../../../../../models/MarketProduct";
import { withAuth } from "../../../../../lib/withAuth";
import MarketCategory from "../../../../../models/MarketCategory";
import User from "../../../../../models/User";
import { encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import cloudinary from "../../../../../lib/cloudinary";


/**
 * @description Get all MarketProduct items created by the authenticated user
 *
 * @route GET /api/marketplace/list-product
 * @auth Required
 * @success {object} 200 - Returns the list of items with populated category and creator info
 * @error {object} 200 - No Items Found (returns empty array)
 * @error {object} 500 - Failed to fetch items from the database
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth (async function (req,user) {
  await connectDB();
    const userId = user?.id;

  try {
    const items = await MarketProduct.find({ isDel: false,createdBy:userId })
      .sort({ createdAt: -1 })
      .select("-__v -isDel")
      .populate("category","name")
      .populate("createdBy","name email mobile image")
      .lean();

      if(!items || items.length===0){
          return addCorsHeaders(NextResponse.json({msg:"No Items Found",items:[]},{status:200}))
      }

      //const baseImageUrl = `${process.env.IMAGE_URL}/e-marketplace`;

      // const updatedItems=items.map(item=>({
      //   ...item,
      //   id:encodeObjectId(item._id),
      //   images: Array.isArray(item.images)
      //   ? item.images.map(img => `${baseImageUrl}/${img}`)
      //   : [],
      //   _id: undefined
      // }))

      const updatedItems = await Promise.all(
      items.map(async (item) => {

        const category = item.category?._id
          ? {
              id: encodeObjectId(item.category._id),
              name: item.category.name,
            }
          : null;

        const createdBy = item.createdBy?._id
          ? {
              id: encodeObjectId(item.createdBy._id),
              name: item.createdBy.name,
              email: item.createdBy.email,
              phone: item.createdBy.mobile,
              image: item.createdBy.image || "/assets/images/default-user.png",
            }
          : null;

        return {
          ...item,
          id: encodeObjectId(item._id),
          _id: undefined,
          images: Array.isArray(item.images) ? item.images : [],
          category,
          currency: item.currency || "",
          createdBy,
        };
      })
    );

     return addCorsHeaders(
      NextResponse.json({ items: updatedItems }, { status: 200 })
    );
  } catch (err) {
    console.error("DB fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    );
  }
});
