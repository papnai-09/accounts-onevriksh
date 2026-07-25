"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";

import { MobileMenu } from "@/components/layout/mobile-menu";

interface NavbarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
    setLoggingOut(false);
    toast({ type: "success", title: "Signed out", description: "You have been signed out successfully." });
    router.push("/login");
  };

  const handleCloseMenu = React.useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-1.5 group">
            <img
              src="/logo.png"
              alt="Onevriksh Logo"
              className="h-6 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-xl font-medium tracking-tight text-slate-500 dark:text-slate-400 hidden sm:block">
              Account
            </span>
          </Link>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  id="user-menu-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 rounded-full border border-slate-200 dark:border-slate-800 p-1 pr-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm"
                >
                  <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} size="sm" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.firstName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 origin-top-right z-50"
                    >
                      <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-3 mb-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/profile", icon: User, label: "Profile" },
                        { href: "/settings", icon: Settings, label: "Settings" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} onClick={() => setDropdownOpen(false)}>
                          <div className="flex items-center space-x-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Icon className="h-4 w-4 text-slate-400" />
                            <span>{label}</span>
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1.5 pt-1.5">
                        <button
                          id="navbar-logout"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="w-full flex items-center space-x-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Google-style Header Action Buttons */
              <div className="flex items-center space-x-3">
                <Link
                  href="/register"
                  className="text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 hover:bg-brand-50/70 dark:hover:bg-brand-950/40 px-4 py-2 rounded-xl transition-all"
                >
                  Create an account
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 px-5 py-2 rounded-xl shadow-md shadow-brand-700/20 active:scale-95 transition-all"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            className="flex h-9 w-9 md:hidden items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-4 w-4 text-slate-600" /> : <Menu className="h-4 w-4 text-slate-600" />}
          </button>
        </div>

        <MobileMenu
          isOpen={menuOpen}
          onClose={handleCloseMenu}
          onLogout={handleLogout}
          user={user}
        />
      </div>
    </header>
  );
}
