"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
  } | null;
}

export const MobileMenu = React.memo(function MobileMenu({
  isOpen,
  onClose,
  onLogout,
  user,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden border-t border-slate-200 dark:border-slate-800 pb-4 pt-3 space-y-2"
        >
          {user ? (
            <>
              <div className="flex items-center space-x-3 px-2 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} size="md" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/profile", label: "Profile" },
                { href: "/settings", label: "Settings" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={onClose} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  {label}
                </Link>
              ))}
              <button onClick={onLogout} className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                Sign Out
              </button>
            </>
          ) : (
            <div className="p-2 space-y-2">
              <Link href="/register" onClick={onClose} className="block text-center rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:bg-slate-50">
                Create an account
              </Link>
              <Link href="/login" onClick={onClose} className="block text-center rounded-xl bg-brand-700 px-3 py-2.5 text-sm font-bold text-white shadow-md">
                Sign in
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
