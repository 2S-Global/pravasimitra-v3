import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import { withAuth } from "../../../../../lib/withAuth";
import User from "../../../../../models/User";
import MembershipPlan from "../../../../../models/MembershipPlan";
import Product from "../../../../../models/Product";
import RoomItem from "../../../../../models/Room";
import MarketProduct from "../../../../../models/MarketProduct";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export const GET = withAuth(async function (req, user) {
  await connectDB();

  try {
    const userDoc = await User.findById(user.id)
      .populate("membershipId");

    if (!userDoc || !userDoc.membershipId) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, message: "No active membership found" },
          { status: 404 }
        )
      );
    }

    const membershipPlan = userDoc.membershipId;

    // Count Posts for this user in real-time
    const [buySellCount, rentLeaseCount, marketplaceCount] = await Promise.all([
      Product.countDocuments({ createdBy: user.id , is_del: false }),
      RoomItem.countDocuments({ createdBy: user.id, isDel: false }),
      MarketProduct.countDocuments({ createdBy: user.id, isDel: false })
    ])

    const statusData = {
      planId: membershipPlan._id,
      planName: membershipPlan.name,
      planPrice: membershipPlan.price,
      limits: membershipPlan.limits,
      durationInDays: membershipPlan.durationInDays,
      isActive: membershipPlan.isActive,
      usage: {
        buySell: buySellCount,
        rentLease: rentLeaseCount,
        marketplace: marketplaceCount
      },
      remaining: {
        buySell: Math.max(0, membershipPlan.limits.buySell - buySellCount),
        rentLease: Math.max(0, membershipPlan.limits.rentLease - rentLeaseCount),
        marketplace: Math.max(0, membershipPlan.limits.marketplace - marketplaceCount)
      }
    };

    return addCorsHeaders(
      NextResponse.json(
        { success: true, data: statusData },
        { status: 200 }
      )
    );

  } catch (err) {
    console.error("Error fetching membership status:", err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
});
