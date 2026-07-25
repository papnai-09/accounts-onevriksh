"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendOtpAction } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";
import * as React from "react";
import { motion } from "framer-motion";

import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { SecurityScore } from "@/components/dashboard/security-score";
import { RecentLogins } from "@/components/dashboard/recent-logins";
import { QuickActions } from "@/components/dashboard/quick-actions";

interface DashboardClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    roles: string[];
    status: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    avatarUrl: string;
    createdAt: string;
  };
  recentLogins: Array<{
    id: string;
    status: string;
    browser: string;
    os: string;
    device: string;
    ipAddress: string;
    createdAt: string;
  }>;
  activeSessions: Array<{
    id: string;
    browser: string;
    os: string;
    device: string;
    ipAddress: string;
    isCurrent: boolean;
  }>;
  securityScore: number;
}

export function DashboardClient({ user, recentLogins, activeSessions, securityScore }: DashboardClientProps) {
  const { toast } = useToast();
  const [resending, setResending] = React.useState(false);

  const handleResendOtp = async () => {
    setResending(true);
    const res = await sendOtpAction(user.phone || "");
    setResending(false);
    toast({
      type: res.success ? "success" : "error",
      title: res.success ? "OTP sent!" : "Failed to send",
      description: res.success ? "Check your mobile phone." : res.error,
    });
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email}
        avatarUrl={user.avatarUrl}
        roles={user.roles}
      />

      {!user.isPhoneVerified && user.phone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-5 py-4 gap-4"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Mobile number not verified</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Verify your mobile number to unlock full security across all Onevriksh platforms.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" isLoading={resending} onClick={handleResendOtp} className="shrink-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40">
            Resend OTP
          </Button>
        </motion.div>
      )}

      <StatsGrid
        securityScore={securityScore}
        activeSessions={activeSessions.length}
        totalLogins={recentLogins.length}
      />

      <SecurityScore
        score={securityScore}
        isEmailVerified={user.isEmailVerified}
        isPhoneVerified={user.isPhoneVerified}
      />

      <RecentLogins recentLogins={recentLogins} />

      <QuickActions />
    </div>
  );
}
