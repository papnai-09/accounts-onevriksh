"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationPreferencesProps {
  notifications: {
    emailLogin: boolean;
    emailSecurity: boolean;
    emailNewsletter: boolean;
    emailProduct: boolean;
  };
  onToggle: (key: keyof NotificationPreferencesProps["notifications"]) => void;
}

export const NotificationPreferences = React.memo(function NotificationPreferences({
  notifications,
  onToggle,
}: NotificationPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <Bell className="h-5 w-5 text-brand-700" />
          <span>Notification Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {[
          { key: "emailLogin" as const, label: "Login activity alerts", desc: "Get notified of new sign-ins" },
          { key: "emailSecurity" as const, label: "Security alerts", desc: "Password changes, suspicious activity" },
          { key: "emailProduct" as const, label: "Product updates", desc: "New features and announcements" },
          { key: "emailNewsletter" as const, label: "Newsletter", desc: "Monthly digest and insights" },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <button
              onClick={() => onToggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications[key] ? "bg-brand-700" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  notifications[key] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
