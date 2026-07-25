import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserService } from "@/services/user.service";
import { getAuthCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { accessToken } = getAuthCookies(cookieStore);
    if (!accessToken) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid access token" }, { status: 401 });
    }

    const user = await UserService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
