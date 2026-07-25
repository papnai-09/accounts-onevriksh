"use client";

import * as React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const DangerZone = React.memo(function DangerZone() {
  const { toast } = useToast();

  return (
    <Card className="border-rose-200 dark:border-rose-900/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Danger Zone</span>
        </CardTitle>
        <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Delete Account</p>
            <p className="text-xs text-slate-500 mt-0.5">Permanently delete your account and all associated data.</p>
          </div>
          <Button variant="danger" size="sm" id="delete-account"
            onClick={() => toast({ type: "warning", title: "Not implemented", description: "Contact support@onevriksh.in to delete your account." })}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
