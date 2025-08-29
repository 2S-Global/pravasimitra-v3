import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import ProductContact from '../../../../../models/ProductContact';
import Product from '../../../../../models/Product';
import User from '../../../../../models/User';
import { withAuth } from '../../../../../lib/withAuth';
import { addCorsHeaders, optionsResponse } from '../../../../../lib/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async (req, user) => {
    await connectDB();

    try {
        const contacts = await ProductContact.find({ userId: user.id})
        .sort({ createdAt: -1 })
        .populate({
            path: "productId",
            select: "title image category",
        })
        .populate({
            path: "sellerId",
            select: "name email phone",
        })
        .lean();

        const result = contacts.map((contact) => ({
            id: contact.productId?._id,
            productTitle: contact.productId?.title,
            productImage: contact.productId?.image,
            sellerName: contact.sellerId?.name,
            sellerEmail: contact.sellerId?.email,
            sellerPhone: contact.sellerId?.phone || "N/A",
            contactedAt: contact.createdAt,
        }));

        return addCorsHeaders(
            NextResponse.json({ list: result}, { status: 200 })
        );
    }
    catch (err) {
        console.log("Fetching contacted sellers failed:", err);
        return addCorsHeaders(
            NextResponse.json({ error: "Failed to fetch contacted sellers" }, { status: 500 })
        );
    }
});