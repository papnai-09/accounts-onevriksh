import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

// Redirect /dashboard → /(dashboard)/dashboard
// This file acts as the redirector for old-style /dashboard paths
export default async function DashboardRedirect() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("onevriksh_access")?.value;
  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded) redirect("/dashboard");
  }
  redirect("/login");
}
