import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserService } from "@/services/user.service";
import { clearAuthCookies, getAuthCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const { accessToken } = getAuthCookies(cookieStore);
    if (!accessToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.password) {
      return NextResponse.json({ success: false, message: "Password confirmation required" }, { status: 400 });
    }

    const res = await UserService.deleteAccount(decoded.userId, body.password);
    clearAuthCookies(cookieStore);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
