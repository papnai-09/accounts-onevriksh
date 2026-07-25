"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecurityScoreProps {
  score: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export const SecurityScore = React.memo(function SecurityScore({
  score,
  isEmailVerified,
  isPhoneVerified,
}: SecurityScoreProps) {
  const scoreColor =
    score >= 80 ? "text-emerald-500" :
    score >= 50 ? "text-amber-500" : "text-rose-500";

  const scoreBgBar =
    score >= 80 ? "bg-emerald-500" :
    score >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-brand-700" />
            <span>Account Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Security score</span>
            <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full transition-all duration-700 ${scoreBgBar}`} style={{ width: `${score}%` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <div className="flex items-center space-x-2 text-xs">
              {isEmailVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <span className={isEmailVerified ? "text-slate-600 dark:text-slate-300" : "text-amber-600"}>Email {isEmailVerified ? "verified" : "unverified"}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              {isPhoneVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <span className={isPhoneVerified ? "text-slate-600 dark:text-slate-300" : "text-amber-600"}>Phone {isPhoneVerified ? "verified" : "unverified"}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Password set</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
