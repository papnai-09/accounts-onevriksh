import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/connect";
import Session from "@/models/Session";
import RefreshToken from "@/models/RefreshToken";

// DELETE /api/auth/sessions — revoke all other sessions
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("onevriksh_access")?.value;
    if (!accessToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    await connectToDatabase();

    // Invalidate all non-current sessions
    await Session.updateMany(
      { userId: decoded.userId, isCurrent: { $ne: true } },
      { $set: { isValid: false } }
    );

    // Delete all refresh tokens except for the current one
    const currentRefresh = cookieStore.get("onevriksh_refresh")?.value;
    if (currentRefresh) {
      await RefreshToken.deleteMany({ userId: decoded.userId, token: { $ne: currentRefresh } });
    } else {
      await RefreshToken.deleteMany({ userId: decoded.userId });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/auth/sessions]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
