import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Amenity from "../../../../../models/Amenity";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";



export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();

  if (!name || name.trim() === "") {
    return addCorsHeaders(
      NextResponse.json({ error: "Amenity name is required" }, { status: 400 })
    );
  }

  try {
    const amenity = await Amenity.create({ name: name.trim() });
    return addCorsHeaders(
      NextResponse.json({ msg: "Amenity created", amenity }, { status: 200 })
    );
  } catch (err) {
    return addCorsHeaders(
      NextResponse.json({ error: "Failed to create amenity" }, { status: 500 })
    );
  }
}
