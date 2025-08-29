import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../../../../models/User';
import { withAuth } from '../../../../../lib/withAuth';
import { addCorsHeaders, optionsResponse } from '../../../../../lib/cors';

export async function OPTIONS() {
  return optionsResponse();
}

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// POST  api/auth/change-password
export const POST = withAuth(async (req, user) => {
  await connectDB();

  try {
    const { currentPassword, newPassword, confirmNewPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return addCorsHeaders(
        NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
      );
    }

    if (newPassword !== confirmNewPassword) {
      return addCorsHeaders(
        NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 })
      );
    }

    const existingUser = await User.findById(user.id).select('+password');
    if (!existingUser) {
      return addCorsHeaders(
        NextResponse.json({ error: 'User not found.' }, { status: 404 })
      );
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isMatch) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();

    return addCorsHeaders(
      NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 })
    );
  } catch (error) {
    console.error('Change password error:', error);
    return addCorsHeaders(
      NextResponse.json({ error: 'Server error.' }, { status: 500 })
    );
  }
});
