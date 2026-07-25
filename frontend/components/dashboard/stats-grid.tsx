"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MonitorSmartphone, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsGridProps {
  securityScore: number;
  activeSessions: number;
  totalLogins: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export const StatsGrid = React.memo(function StatsGrid({
  securityScore,
  activeSessions,
  totalLogins,
}: StatsGridProps) {
  const scoreColor =
    securityScore >= 80 ? "text-emerald-500" :
    securityScore >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { icon: ShieldCheck, label: "Security Score", value: `${securityScore}%`, color: scoreColor, i: 0 },
        { icon: MonitorSmartphone, label: "Active Sessions", value: activeSessions.toString(), color: "text-sky-500", i: 1 },
        { icon: Activity, label: "Recent Logins", value: totalLogins.toString(), color: "text-purple-500", i: 2 },
      ].map(({ icon: Icon, label, value, color, i }) => (
        <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:shadow-card-hover transition-shadow">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                <p className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});
