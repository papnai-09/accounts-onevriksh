"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Settings, Lock, MonitorSmartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export const QuickActions = React.memo(function QuickActions() {
  return (
    <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/profile", icon: User, label: "Edit Profile", color: "text-brand-700 bg-brand-50 dark:bg-brand-950/50" },
              { href: "/settings", icon: Settings, label: "Account Settings", color: "text-slate-600 bg-slate-100 dark:bg-slate-800" },
              { href: "/security", icon: Lock, label: "Security Center", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
              { href: "/security", icon: MonitorSmartphone, label: "Active Sessions", color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href + label}
                href={href}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 text-center hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              >
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
