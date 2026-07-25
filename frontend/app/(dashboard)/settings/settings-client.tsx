"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { DangerZone } from "@/components/settings/danger-zone";

interface SettingsClientProps {
  userId: string;
  email: string;
}

export function SettingsClient({ userId, email }: SettingsClientProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState({
    emailLogin: true,
    emailSecurity: true,
    emailNewsletter: false,
    emailProduct: true,
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ type: "success", title: "Preferences saved", description: "Notification settings updated." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Settings className="h-6 w-6 text-brand-700" />
          <span>Account Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and security settings.</p>
      </div>

      <ChangePasswordForm />

      <NotificationPreferences
        notifications={notifications}
        onToggle={handleNotificationToggle}
      />

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account ID</p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-200 mt-0.5">{userId}</p>
            </div>
            <Badge variant="info">Verified</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Email</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DangerZone />
    </motion.div>
  );
}
