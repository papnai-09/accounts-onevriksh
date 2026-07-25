import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
