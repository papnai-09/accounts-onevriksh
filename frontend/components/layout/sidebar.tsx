"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems } from "@/config/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 lg:w-64 shrink-0">
      <div className="sticky top-4">
        <nav className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 shadow-sm">
          <ul className="space-y-0.5">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link href={href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={`flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-brand-700 text-white shadow-md shadow-brand-700/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Help Card */}
          <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 p-4">
            <p className="text-xs font-bold text-brand-800 dark:text-brand-300">Need help?</p>
            <p className="mt-1 text-xs text-brand-600 dark:text-brand-400 leading-relaxed">
              Contact our support team for assistance with your account.
            </p>
            <a
              href="mailto:support@onevriksh.in"
              className="mt-3 inline-block text-xs font-bold text-brand-700 hover:underline"
            >
              support@onevriksh.in →
            </a>
          </div>
        </nav>
      </div>
    </aside>
  );
}
