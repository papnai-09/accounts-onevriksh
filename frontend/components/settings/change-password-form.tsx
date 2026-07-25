"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { changePasswordSchema, ChangePasswordInput } from "@/lib/validations/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const ChangePasswordForm = React.memo(function ChangePasswordForm() {
  const { toast } = useToast();
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [changingPw, setChangingPw] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordInput) => {
    setChangingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast({ type: "success", title: "Password updated!", description: "Your password has been changed successfully." });
        reset();
      } else {
        toast({ type: "error", title: "Failed", description: json.error });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Could not change password. Please try again." });
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <Lock className="h-5 w-5 text-brand-700" />
          <span>Change Password</span>
        </CardTitle>
        <CardDescription>Use a strong, unique password for maximum security.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            id="settings-current-pw"
            type={showCurrent ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} tabIndex={-1} className="text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <Input
            label="New Password"
            id="settings-new-pw"
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowNew(!showNew)} tabIndex={-1} className="text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <Input
            label="Confirm New Password"
            id="settings-confirm-pw"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} className="text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={changingPw} id="settings-change-pw">
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
