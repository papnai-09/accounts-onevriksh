import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20">
      <Navbar user={null} />
      <main className="flex min-h-[calc(100vh-4rem-5rem)] items-center justify-center px-4 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
