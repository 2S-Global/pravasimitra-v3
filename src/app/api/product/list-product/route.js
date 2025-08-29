import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";
import { ProductCategory } from "../../../../../models/ProductCategory";
import { withAuth } from "../../../../../lib/withAuth";
import { encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";
import ProductContact from "../../../../../models/ProductContact";

/**
 * @description Get all Products created by the authenticated user (excluding deleted)
 * @route GET /api/product/my-items
 * @auth Required
 * @success {object} 200 - Returns an array of Products with encoded IDs
 * @error {object} 500 - Database query failed or server error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async function (req, user) {
  await connectDB();

  const userId = user?.id;

  try {
    const products = await Product.find({ is_del: false, createdBy: userId })
      .sort({ createdAt: -1 })
      .select("-__v -is_del")
      .populate("category", "name")
      .populate("createdBy", "name email mobile")
      .lean();

    if (!products || products.length === 0) {
      return addCorsHeaders(
        NextResponse.json(
          { msg: "No Products Found", items: [] },
          { status: 200 }
        )
      );
    }

    const updatedProducts = await Promise.all(
      products.map(async (item) => {
        const contactDocs = await ProductContact.find({
          productId: item._id,
        })
          .populate("userId", "name email mobile image")
          .lean();

        // Safely map contacts from userId
        const contacts = contactDocs.map((contact) => ({
          name: contact.userId?.name || "",
          email: contact.userId?.email || "",
          phone: contact.userId?.mobile || "",
          image: contact.userId?.image || "/assets/images/default-user.png",
        }));

        // Encode category ID if present
        const category = item.category?._id
          ? {
              id: encodeObjectId(item.category._id),
              name: item.category.name,
            }
          : null;

        return {
          ...item,
          id: encodeObjectId(item._id),
          _id: undefined,
          image: item.image || null,
          gallery: Array.isArray(item.gallery) ? item.gallery : [],
          contactCount: contactDocs.length,
          contacts,
          category,
          currency: item.currency || "",
        };
      })
    );

    return addCorsHeaders(
      NextResponse.json({ items: updatedProducts }, { status: 200 })
    );
  } catch (err) {
    console.error("DB fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to fetch product items" },
        { status: 500 }
      )
    );
  }
});
