import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/connect";
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";
import Session from "@/models/Session";
import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("onevriksh_access")?.value;

  if (!accessToken) redirect("/login");

  const decoded = await verifyAccessToken(accessToken);
  if (!decoded) redirect("/login");

  let user: any = null;
  let recentLogins: any[] = [];
  let activeSessions: any[] = [];

  try {
    await connectToDatabase();
    const dbUser = (await User.findById(decoded.userId).lean()) as any;
    if (!dbUser || dbUser.isDeleted) redirect("/login");

    user = {
      id: String(dbUser._id),
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      phone: dbUser.phone,
      roles: dbUser.roles,
      status: dbUser.status,
      isEmailVerified: dbUser.isEmailVerified,
      isPhoneVerified: dbUser.isPhoneVerified,
      avatarUrl: dbUser.avatarUrl || "",
      createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
    };

    recentLogins = await LoginHistory.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .then((docs) =>
        docs.map((d: any) => ({
          id: String(d._id),
          status: d.status,
          browser: d.browser,
          os: d.os,
          device: d.device,
          ipAddress: d.ipAddress,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }))
      );

    activeSessions = await Session.find({ userId: decoded.userId, isValid: true, expiresAt: { $gt: new Date() } })
      .lean()
      .then((docs) =>
        docs.map((d: any) => ({
          id: String(d._id),
          browser: d.browser,
          os: d.os,
          device: d.device,
          ipAddress: d.ipAddress,
          isCurrent: d.isCurrent,
        }))
      );
  } catch (err) {
    // Dev mode fallback — MongoDB may not be connected locally
    user = {
      id: decoded.userId,
      firstName: "Demo",
      lastName: "User",
      email: decoded.email,
      phone: "",
      roles: decoded.roles,
      status: "ACTIVE",
      isEmailVerified: decoded.isEmailVerified,
      isPhoneVerified: false,
      avatarUrl: "",
      createdAt: new Date().toISOString(),
    };
  }

  const securityScore = Math.round(
    ((user?.isEmailVerified ? 40 : 0) as number) + ((user?.isPhoneVerified ? 30 : 0) as number) + 30
  );

  return <DashboardClient user={user} recentLogins={recentLogins} activeSessions={activeSessions} securityScore={securityScore} />;
}
