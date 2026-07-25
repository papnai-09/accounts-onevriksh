import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const metadata: Metadata = {
  title: "Account Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("onevriksh_access")?.value;
  let user = null;

  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded) {
      user = {
        firstName: "User",
        lastName: "",
        email: decoded.email,
        avatarUrl: "",
      };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20">
      <Navbar user={user} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
