"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MonitorSmartphone, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
}

interface ActiveSessionsCardProps {
  sessions: Session[];
  revokingId: string | null;
  revokingAll: boolean;
  onRevokeSession: (id: string) => void;
  onRevokeAllSessions: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

export const ActiveSessionsCard = React.memo(function ActiveSessionsCard({
  sessions,
  revokingId,
  revokingAll,
  onRevokeSession,
  onRevokeAllSessions,
}: ActiveSessionsCardProps) {
  return (
    <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <MonitorSmartphone className="h-5 w-5 text-brand-700" />
              <span>Active Sessions ({sessions.length})</span>
            </CardTitle>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <Button
                variant="danger"
                size="sm"
                isLoading={revokingAll}
                onClick={onRevokeAllSessions}
                id="revoke-all-sessions"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Sign Out All Other Devices
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No active sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-all ${
                  session.isCurrent
                    ? "border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${session.isCurrent ? "bg-brand-100 dark:bg-brand-950" : "bg-slate-100 dark:bg-slate-800"}`}>
                    <MonitorSmartphone className={`h-5 w-5 ${session.isCurrent ? "text-brand-700" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {session.browser} on {session.os}
                      {session.isCurrent && (
                        <Badge variant="info" className="ml-2 text-xs">Current</Badge>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {session.ipAddress} · Last active {session.lastActive ? new Date(session.lastActive).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={revokingId === session.id}
                    onClick={() => onRevokeSession(session.id)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
