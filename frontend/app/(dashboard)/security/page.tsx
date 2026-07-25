import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/connect";
import Session from "@/models/Session";
import LoginHistory from "@/models/LoginHistory";
import type { Metadata } from "next";
import { SecurityClient } from "./security-client";

export const metadata: Metadata = { title: "Security Center" };

export default async function SecurityPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("onevriksh_access")?.value;
  if (!accessToken) redirect("/login");

  const decoded = await verifyAccessToken(accessToken);
  if (!decoded) redirect("/login");

  let sessions: any[] = [];
  let loginHistory: any[] = [];
  let currentSessionId: string | null = null;

  try {
    await connectToDatabase();

    sessions = await Session.find({ userId: decoded.userId, isValid: true, expiresAt: { $gt: new Date() } })
      .sort({ updatedAt: -1 })
      .lean()
      .then((docs) =>
        docs.map((d: any) => ({
          id: String(d._id),
          browser: d.browser || "Unknown Browser",
          os: d.os || "Unknown OS",
          device: d.device || "Unknown Device",
          ipAddress: d.ipAddress || "Unknown",
          isCurrent: d.isCurrent,
          lastActive: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }))
      );

    const currentSession = sessions.find((s) => s.isCurrent);
    currentSessionId = currentSession ? String(currentSession.id) : null;

    loginHistory = await LoginHistory.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .then((docs) =>
        docs.map((d: any) => ({
          id: String(d._id),
          status: d.status,
          browser: d.browser || "Unknown",
          os: d.os || "Unknown",
          device: d.device || "Unknown",
          ipAddress: d.ipAddress || "Unknown",
          failureReason: d.failureReason || null,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }))
      );
  } catch {
    sessions = [];
    loginHistory = [];
  }

  return (
    <SecurityClient
      sessions={sessions}
      loginHistory={loginHistory}
      currentSessionId={currentSessionId}
      userId={decoded.userId}
    />
  );
}
