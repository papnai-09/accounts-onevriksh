import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.token) {
      return NextResponse.json({ success: false, message: "Verification token is required" }, { status: 400 });
    }

    const res = await AuthService.verifyEmail(body.token);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
