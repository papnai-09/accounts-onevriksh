"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LoginRecord {
  id: string;
  status: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  failureReason: string | null;
  createdAt: string;
}

interface LoginHistoryCardProps {
  loginHistory: LoginRecord[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

export const LoginHistoryCard = React.memo(function LoginHistoryCard({ loginHistory }: LoginHistoryCardProps) {
  return (
    <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Clock className="h-5 w-5 text-brand-700" />
            <span>Login History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loginHistory.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No login history available.</p>
          ) : (
            <div className="space-y-2">
              {loginHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                  <div className="flex items-center space-x-3">
                    {record.status === "SUCCESS" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : record.status === "FAILED" ? (
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {record.browser} on {record.os}
                      </p>
                      <p className="text-xs text-slate-400">
                        {record.ipAddress}
                        {record.failureReason && ` · ${record.failureReason}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <Badge variant={record.status === "SUCCESS" ? "success" : "danger"}>
                      {record.status === "SUCCESS" ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
