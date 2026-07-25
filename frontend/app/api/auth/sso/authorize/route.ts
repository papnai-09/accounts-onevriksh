import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SsoService } from "@/services/sso.service";
import { getAuthCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectUri = searchParams.get("redirect_uri") || searchParams.get("returnUrl");

    if (!redirectUri || !SsoService.isAllowedRedirectDomain(redirectUri)) {
      return NextResponse.json({ success: false, message: "Invalid or unauthorized redirect URI" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const { accessToken } = getAuthCookies(cookieStore);
    if (!accessToken) {
      // Redirect guest to login with returnUrl
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("returnUrl", redirectUri);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("returnUrl", redirectUri);
      return NextResponse.redirect(loginUrl);
    }

    const code = await SsoService.createAuthorizationCode(
      decoded.userId,
      decoded.email,
      decoded.roles,
      redirectUri
    );

    const targetUrl = new URL(redirectUri);
    targetUrl.searchParams.set("code", code);
    return NextResponse.redirect(targetUrl);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.code) {
      return NextResponse.json({ success: false, message: "Authorization code required" }, { status: 400 });
    }

    const result = await SsoService.exchangeCodeForToken(body.code);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
