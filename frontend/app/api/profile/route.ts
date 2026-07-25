import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserService } from "@/services/user.service";
import { updateProfileSchema } from "@/lib/validations/auth";
import { getAuthCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function PUT(req: Request) {
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
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const res = await UserService.updateProfile(decoded.userId, parsed.data);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
