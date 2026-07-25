"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthorizeClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [authData, setAuthData] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type") || "code";
  const scope = searchParams.get("scope") || "openid profile email";
  const state = searchParams.get("state") || "";
  const codeChallenge = searchParams.get("code_challenge") || "";
  const codeChallengeMethod = searchParams.get("code_challenge_method") || "S256";
  const nonce = searchParams.get("nonce") || undefined;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  React.useEffect(() => {
    async function checkAuthorization() {
      if (!clientId || !redirectUri || !codeChallenge) {
        setError("Missing required OAuth 2.1 parameters (client_id, redirect_uri, code_challenge)");
        setLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: responseType,
          scope,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
        });
        if (nonce) query.append("nonce", nonce);

        const res = await fetch(`${backendUrl}/api/oauth/authorize?${query.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error_description || data.error || "Authorization error");
          setLoading(false);
          return;
        }

        if (data.authenticated === false) {
          // Redirect to login page
          const currentUrl = window.location.href;
          window.location.href = `/login?return_to=${encodeURIComponent(currentUrl)}`;
          return;
        }

        if (data.authenticated && !data.consentRequired && data.redirectUri) {
          // Auto-redirect for pre-approved or first-party client
          window.location.href = data.redirectUri;
          return;
        }

        setAuthData(data);
      } catch (err: any) {
        setError(err.message || "Failed to contact authorization server");
      } finally {
        setLoading(false);
      }
    }

    checkAuthorization();
  }, [clientId, redirectUri, responseType, scope, state, codeChallenge, codeChallengeMethod, nonce, backendUrl]);

  const handleConsent = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/oauth/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          nonce,
          approved,
        }),
      });

      const data = await res.json();
      if (data.redirectUri) {
        window.location.href = data.redirectUri;
      } else if (data.error) {
        setError(data.error_description || data.error);
      }
    } catch {
      setError("Failed to submit consent");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Verifying Single Sign-On session…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900/90 p-6 text-center text-slate-100 shadow-2xl backdrop-blur-xl">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-100">Authorization Error</h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Button
            className="mt-6 w-full"
            variant="outline"
            onClick={() => (window.location.href = "/login")}
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  const client = authData?.client || { clientName: "Application" };
  const scopes: string[] = authData?.scopes || scope.split(" ");

  const scopeLabels: Record<string, { title: string; desc: string }> = {
    openid: { title: "Authenticate your account", desc: "Verify your identity on OneVriksh Accounts" },
    profile: { title: "Read your basic profile", desc: "Access your name, avatar, and account details" },
    email: { title: "Access your email address", desc: "View your verified email address" },
    offline_access: { title: "Maintain persistent access", desc: "Access your data when you are offline" },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-slate-100 shadow-2xl backdrop-blur-2xl"
      >
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-400">OneVriksh SSO Identity Provider</h2>
              <p className="text-xs text-slate-500">accounts.onevriksh.in</p>
            </div>
          </div>
        </div>

        {/* Client Application Info */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Connect to <span className="text-emerald-400">{client.clientName}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            <strong className="text-slate-200">{client.clientName}</strong> is requesting authorization to access your OneVriksh account.
          </p>
        </div>

        {/* Scopes List */}
        <div className="mb-8 space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Permissions Requested:
          </p>
          {scopes.map((s) => {
            const info = scopeLabels[s] || { title: s, desc: `Access ${s} permission` };
            return (
              <div key={s} className="flex items-start space-x-3 text-left">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{info.title}</p>
                  <p className="text-xs text-slate-400">{info.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            className="w-full border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => handleConsent(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30"
            onClick={() => handleConsent(true)}
            isLoading={isSubmitting}
          >
            <span>Allow & Continue</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Authorization...</div>}>
      <AuthorizeClient />
    </React.Suspense>
  );
}
