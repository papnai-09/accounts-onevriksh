import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/connect";
import Session from "@/models/Session";

// DELETE /api/auth/sessions/[sessionId] — revoke a specific session
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("onevriksh_access")?.value;
    if (!accessToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    await connectToDatabase();

    const session = await Session.findOne({ _id: sessionId, userId: decoded.userId });
    if (!session) return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });

    if (session.isCurrent) {
      return NextResponse.json({ success: false, error: "Cannot revoke your current session" }, { status: 400 });
    }

    await Session.updateOne({ _id: sessionId }, { $set: { isValid: false } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/auth/sessions/[sessionId]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
