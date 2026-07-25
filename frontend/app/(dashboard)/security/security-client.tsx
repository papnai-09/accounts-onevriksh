"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useToast } from "@/components/ui/toast";

import { ActiveSessionsCard } from "@/components/security/active-sessions-card";
import { LoginHistoryCard } from "@/components/security/login-history-card";

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

interface SecurityClientProps {
  sessions: Session[];
  loginHistory: LoginRecord[];
  currentSessionId: string | null;
  userId: string;
}

export function SecurityClient({ sessions: initialSessions, loginHistory, currentSessionId, userId }: SecurityClientProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = React.useState(initialSessions);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [revokingAll, setRevokingAll] = React.useState(false);

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast({ type: "success", title: "Session revoked", description: "The device has been signed out." });
      } else {
        toast({ type: "error", title: "Failed to revoke session", description: "Please try again." });
      }
    } catch {
      toast({ type: "error", title: "Network error", description: "Could not reach server." });
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      const res = await fetch("/api/auth/sessions", { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        toast({ type: "success", title: "All other sessions revoked", description: "Only your current session remains." });
      } else {
        toast({ type: "error", title: "Failed", description: "Could not revoke all sessions." });
      }
    } catch {
      toast({ type: "error", title: "Network error", description: "Could not reach server." });
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-brand-700" />
          <span>Security Center</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Monitor and manage your account security across all devices.</p>
      </div>

      <ActiveSessionsCard
        sessions={sessions}
        revokingId={revokingId}
        revokingAll={revokingAll}
        onRevokeSession={revokeSession}
        onRevokeAllSessions={revokeAllSessions}
      />

      <LoginHistoryCard loginHistory={loginHistory} />
    </motion.div>
  );
}
