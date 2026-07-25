"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentLoginsProps {
  recentLogins: Array<{
    id: string;
    status: string;
    browser: string;
    os: string;
    device: string;
    ipAddress: string;
    createdAt: string;
  }>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export const RecentLogins = React.memo(function RecentLogins({ recentLogins }: RecentLoginsProps) {
  return (
    <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2">
              <Clock className="h-5 w-5 text-brand-700" />
              <span>Recent Login Activity</span>
            </CardTitle>
            <Link href="/security" className="text-xs font-semibold text-brand-700 flex items-center">
              View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentLogins.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No login history yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLogins.map((login) => (
                <div key={login.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={login.status === "SUCCESS" ? "success" : "danger"}>
                      {login.status === "SUCCESS" ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{login.browser} on {login.os}</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(login.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
