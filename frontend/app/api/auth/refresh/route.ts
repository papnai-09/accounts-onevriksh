import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/services/auth.service";
import { getAuthCookies, setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const { refreshToken } = getAuthCookies(cookieStore);
    if (!refreshToken) {
      return NextResponse.json({ success: false, message: "No refresh token provided" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const tokens = await AuthService.refreshTokens(refreshToken, ip, userAgent);
    setAuthCookies(cookieStore, tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({ success: true, accessToken: tokens.accessToken });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}
