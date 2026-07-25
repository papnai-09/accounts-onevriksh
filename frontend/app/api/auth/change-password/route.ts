import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/connect";
import User from "@/models/User";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import RefreshToken from "@/models/RefreshToken";
import Session from "@/models/Session";

// POST /api/auth/change-password
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("onevriksh_access")?.value;
    if (!accessToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const { currentPassword, newPassword, confirmNewPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "Password too short" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId).select("+passwordHash");
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await User.updateOne({ _id: user._id }, { $set: { passwordHash: newHash } });

    // Invalidate all other sessions for security
    const currentRefresh = cookieStore.get("onevriksh_refresh")?.value;
    if (currentRefresh) {
      await RefreshToken.deleteMany({ userId: decoded.userId, token: { $ne: currentRefresh } });
    }
    await Session.updateMany(
      { userId: decoded.userId, isCurrent: { $ne: true } },
      { $set: { isValid: false } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/change-password]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
