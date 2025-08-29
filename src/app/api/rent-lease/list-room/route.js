import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "../../../../../lib/db";
import RoomItem from "../../../../../models/Room";
import { withAuth } from "../../../../../lib/withAuth";
import RoomCategory from "../../../../../models/RoomCategory";
import RoomContact from "../../../../../models/RoomContact";
import User from "../../../../../models/User";
import { encodeObjectId } from "../../../../../lib/idCodec";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

/**
 * @description Get all RoomItems created by the authenticated user (excluding deleted)
 * @route GET /api/rent-lease/my-items
 * @success {object} 200 - Returns an array of RoomItems with encoded IDs
 * @error {object} 500 - Database query failed or server error
 */

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async function (req, user) {
  await connectDB();
  const userId = user?.id;

  try {
    const items = await RoomItem.find({ isDel: false, createdBy: userId })
      .sort({ createdAt: -1 })
      .select("-__v -isDel")
      .populate("propertyType", "name")
      .populate("createdBy", "name email mobile")
      .lean();

    if (!items || items.length === 0) {
      return addCorsHeaders(
        NextResponse.json({ msg: "No Items Found", items: [] }, { status: 200 })
      );
    }

    //const baseImageUrl = `${process.env.IMAGE_URL}/rent-items`;

    // const updatedItems = items.map((item) => ({
    //   ...item,
    //   id: encodeObjectId(item._id),
    //   images: Array.isArray(item.images)
    //     ? item.images.map((img) => `${baseImageUrl}/${img}`)
    //     : [],
    //   _id: undefined,
    // }));

    //     return NextResponse.json({ items: updatedItems }, { status: 200 });
    //   } catch (err) {
    //     console.error("DB fetch failed:", err);
    //     return NextResponse.json(
    //       { error: "Failed to fetch rent items" },
    //       { status: 500 }
    //     );
    //   }
    // });

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const contactDocs = await RoomContact.find({ roomId: item._id })
          .populate("userId", "name email mobile image")
          .lean();

        const contacts = contactDocs.map((contact) => ({
          name: contact.userId?.name || "",
          email: contact.userId?.email || "",
          phone: contact.userId?.mobile || "",
          image: contact.userId?.image || "/assets/images/default-user.png",
        }));

        // Encode propertyType(category) ID if present
        const propertyType = item.propertyType?._id
          ? {
              id: encodeObjectId(item.propertyType._id),
              name: item.propertyType.name,
            }
          : null;

        return {
          ...item,
          id: encodeObjectId(item._id),
          _id: undefined,
          images: item.images || null,
          contactCount: contactDocs.length,
          contacts,
          propertyType,
          currency: item.currency || "",
        };
      })
    );

    return addCorsHeaders(
      NextResponse.json({ items: updatedItems }, { status: 200 })
    );
  } catch (err) {
    console.error("DB fetch failed:", err);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to fetch room items" },
        { status: 500 }
      )
    );
  }
});
