import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";
import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("onevriksh_access")?.value;
  if (!accessToken) redirect("/login");

  const decoded = await verifyAccessToken(accessToken);
  if (!decoded) redirect("/login");

  return <SettingsClient userId={decoded.userId} email={decoded.email} />;
}
