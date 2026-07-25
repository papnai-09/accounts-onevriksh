"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AppWindow, ShieldAlert, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface ConnectedAppItem {
  clientId: string;
  clientName: string;
  logoUrl?: string;
  grantedScopes: string[];
  grantedAt: string;
}

export default function ConnectedAppsPage() {
  const [apps, setApps] = React.useState<ConnectedAppItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchConnectedApps = React.useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/user/connected-apps`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.connectedApps) {
        setApps(data.connectedApps);
      }
    } catch {
      toast({ type: "error", title: "Failed to load connected applications" });
    } finally {
      setLoading(false);
    }
  }, [backendUrl, toast]);

  React.useEffect(() => {
    fetchConnectedApps();
  }, [fetchConnectedApps]);

  const handleRevokeConsent = async (clientId: string) => {
    setRevokingId(clientId);
    try {
      const res = await fetch(`${backendUrl}/api/user/connected-apps/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ type: "success", title: "Application access revoked" });
        setApps((prev) => prev.filter((a) => a.clientId !== clientId));
      }
    } catch {
      toast({ type: "error", title: "Failed to revoke consent" });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6 text-slate-100">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <AppWindow className="h-8 w-8 text-emerald-400" />
          Connected Applications
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Applications authorized to access your OneVriksh Account details. You can revoke access at any time.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading connected applications...</div>
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          No third-party applications have access to your account.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((app) => (
            <motion.div
              key={app.clientId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl hover:border-slate-700"
            >
              <div>
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <AppWindow className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{app.clientName}</h3>
                    <p className="text-xs text-slate-400">Client ID: {app.clientId}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Granted Scopes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.grantedScopes.map((scope) => (
                      <span
                        key={scope}
                        className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300 border border-slate-700"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Authorized on: {new Date(app.grantedAt).toLocaleDateString()}
                </p>
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                onClick={() => handleRevokeConsent(app.clientId)}
                isLoading={revokingId === app.clientId}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Revoke Application Access
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
