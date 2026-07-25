import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/services/auth.service";
import { loginSchema } from "@/lib/validations/auth";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await AuthService.login(parsed.data, ip, userAgent);
    if (result.accessToken && result.refreshToken) {
      const cookieStore = await cookies();
      setAuthCookies(cookieStore, result.accessToken, result.refreshToken, parsed.data.rememberMe);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Invalid credentials" },
      { status: 401 }
    );
  }
}
