import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "onevriksh Accounts — Central Identity Platform",
  description: "Your single account for the entire onevriksh ecosystem.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-brand-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20">
      <Navbar user={null} />

      <main className="flex-1">
        <HomeClient />
      </main>

      <Footer />
    </div>
  );
}
