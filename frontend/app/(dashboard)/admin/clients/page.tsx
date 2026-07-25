"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { KeyRound, Plus, Copy, Check, RefreshCw, Trash2, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface OAuthClientItem {
  _id: string;
  clientId: string;
  clientName: string;
  redirectUris: string[];
  allowedOrigins: string[];
  scopes: string[];
  isFirstParty: boolean;
  status: string;
  createdAt: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = React.useState<OAuthClientItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [newSecretData, setNewSecretData] = React.useState<{ clientId: string; secret: string } | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    clientName: "",
    redirectUris: "",
    allowedOrigins: "",
    isFirstParty: false,
    isPublic: false,
  });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchClients = React.useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/clients`, { credentials: "include" });
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
      }
    } catch {
      toast({ type: "error", title: "Failed to load OAuth applications" });
    } finally {
      setLoading(false);
    }
  }, [backendUrl, toast]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        clientName: formData.clientName,
        redirectUris: formData.redirectUris.split(",").map((s) => s.trim()),
        allowedOrigins: formData.allowedOrigins ? formData.allowedOrigins.split(",").map((s) => s.trim()) : [],
        isFirstParty: formData.isFirstParty,
        isPublic: formData.isPublic,
      };

      const res = await fetch(`${backendUrl}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast({ type: "success", title: "OAuth Client created successfully!" });
        if (data.rawSecret) {
          setNewSecretData({ clientId: data.client.clientId, secret: data.rawSecret });
        }
        setShowCreateModal(false);
        fetchClients();
      } else {
        toast({ type: "error", title: data.message || "Failed to create client" });
      }
    } catch {
      toast({ type: "error", title: "Creation error" });
    }
  };

  const handleRotateSecret = async (clientId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/clients/${clientId}/rotate-secret`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.rawSecret) {
        setNewSecretData({ clientId, secret: data.rawSecret });
        toast({ type: "success", title: "Client secret rotated!" });
      }
    } catch {
      toast({ type: "error", title: "Failed to rotate secret" });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ type: "success", title: "Client application deleted" });
        setClients((prev) => prev.filter((c) => c.clientId !== clientId));
      }
    } catch {
      toast({ type: "error", title: "Failed to delete client" });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 p-6 text-slate-100">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <KeyRound className="h-8 w-8 text-emerald-400" />
            OAuth Client Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Register and manage relying party applications (`study.onevriksh.in`, `travel.onevriksh.in`, etc.).
          </p>
        </div>

        <Button
          className="bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Register New Application
        </Button>
      </div>

      {/* Secret Display Modal */}
      {newSecretData && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 text-amber-200">
          <h3 className="text-lg font-bold">⚠️ Copy Your Client Secret Now</h3>
          <p className="mt-1 text-sm text-amber-300/80">
            This secret will NOT be shown again. Store it securely in your application environment.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950 p-3 font-mono text-sm text-emerald-400">
            <span>{newSecretData.secret}</span>
            <button
              onClick={() => copyToClipboard(newSecretData.secret, "secret")}
              className="ml-auto text-slate-400 hover:text-white"
            >
              {copiedId === "secret" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 border-amber-500/40 text-amber-200 hover:bg-amber-900/40"
            onClick={() => setNewSecretData(null)}
          >
            I have saved the secret
          </Button>
        </div>
      )}

      {/* Client List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading OAuth client applications...</div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          No registered OAuth applications found. Create one to enable SSO for your apps.
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <motion.div
              key={client.clientId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl hover:border-slate-700"
            >
              <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-start sm:space-y-0">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{client.clientName}</h3>
                    {client.isFirstParty && (
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        First-Party App
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 font-mono text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <span className="text-slate-500">Client ID:</span>
                      <span className="text-emerald-400 font-semibold">{client.clientId}</span>
                      <button
                        onClick={() => copyToClipboard(client.clientId, client.clientId)}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {copiedId === client.clientId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </p>
                  </div>

                  <div className="mt-4 space-y-1 text-xs">
                    <p className="text-slate-400 font-semibold">Allowed Redirect URIs:</p>
                    {client.redirectUris.map((uri) => (
                      <p key={uri} className="font-mono text-slate-300">{uri}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    onClick={() => handleRotateSecret(client.clientId)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Rotate Secret
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800 text-slate-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => handleDeleteClient(client.clientId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <h2 className="text-2xl font-bold text-white mb-4">Register New OAuth Application</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Application Name</label>
                <Input
                  type="text"
                  placeholder="e.g. OneVriksh Study"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Redirect URIs (comma-separated)
                </label>
                <Input
                  type="text"
                  placeholder="https://study.onevriksh.in/api/auth/callback"
                  value={formData.redirectUris}
                  onChange={(e) => setFormData({ ...formData, redirectUris: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Allowed Origins (CORS, comma-separated)
                </label>
                <Input
                  type="text"
                  placeholder="https://study.onevriksh.in"
                  value={formData.allowedOrigins}
                  onChange={(e) => setFormData({ ...formData, allowedOrigins: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="firstParty"
                  checked={formData.isFirstParty}
                  onChange={(e) => setFormData({ ...formData, isFirstParty: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
                <label htmlFor="firstParty" className="text-xs text-slate-300 font-medium">
                  First-Party Application (Auto-approve consent prompts)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500">
                  Register App
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
