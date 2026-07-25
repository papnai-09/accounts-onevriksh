import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Onevriksh Accounts — Central Identity Platform",
    template: "%s | Onevriksh Accounts",
  },
  description:
    "Your single Onevriksh account gives you access to the entire Onevriksh ecosystem.",
  keywords: [
    "Onevriksh",
    "accounts",
    "login",
    "register",
    "authentication",
    "single sign-on",
    "SSO",
    "identity",
  ],
  authors: [{ name: "Onevriksh", url: "https://onevriksh.in" }],
  creator: "Onevriksh",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://accounts.onevriksh.in",
    title: "Onevriksh Accounts — Central Identity Platform",
    description:
      "Your single Onevriksh account gives you access to the entire Onevriksh ecosystem.",
    siteName: "Onevriksh Accounts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onevriksh Accounts",
    description: "One account. Entire ecosystem.",
    creator: "@onevriksh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/theme-init.js" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
