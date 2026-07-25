"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Globe, Shield, Trash2, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface SessionItem {
  id: string;
  browser: string;
  os: string;
  deviceName: string;
  ipAddress: string;
  country: string;
  lastActivity: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = React.useState<SessionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [terminatingId, setTerminatingId] = React.useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = React.useState(false);
  const { toast } = useToast();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchSessions = React.useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/sessions`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch {
      toast({ type: "error", title: "Failed to load active sessions" });
    } finally {
      setLoading(false);
    }
  }, [backendUrl, toast]);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingId(sessionId);
    try {
      const res = await fetch(`${backendUrl}/api/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ type: "success", title: "Session terminated successfully" });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch {
      toast({ type: "error", title: "Failed to terminate session" });
    } finally {
      setTerminatingId(null);
    }
  };

  const handleTerminateOtherSessions = async () => {
    setTerminatingAll(true);
    try {
      const res = await fetch(`${backendUrl}/api/sessions/other`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ type: "success", title: "Logged out from all other devices" });
        setSessions((prev) => prev.filter((s) => s.isCurrent));
      }
    } catch {
      toast({ type: "error", title: "Failed to terminate other sessions" });
    } finally {
      setTerminatingAll(false);
    }
  };

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            Active Sessions
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your active web browser logins and revoke access from lost or untrusted devices.
          </p>
        </div>

        {sessions.length > 1 && (
          <Button
            variant="outline"
            className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
            onClick={handleTerminateOtherSessions}
            isLoading={terminatingAll}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout All Other Devices
          </Button>
        )}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading active sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          No active sessions found.
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col space-y-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 ${
                session.isCurrent
                  ? "border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-950/20"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    session.isCurrent ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {session.deviceName.toLowerCase().includes("mobile") ||
                  session.os.toLowerCase().includes("ios") ||
                  session.os.toLowerCase().includes("android") ? (
                    <Smartphone className="h-6 w-6" />
                  ) : (
                    <Monitor className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {session.browser} on {session.os}
                    </h3>
                    {session.isCurrent && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Current Device
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-slate-500" />
                      {session.country} ({session.ipAddress})
                    </span>
                    <span>Last active: {new Date(session.lastActivity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800/60 text-slate-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                  onClick={() => handleTerminateSession(session.id)}
                  isLoading={terminatingId === session.id}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Terminate
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
