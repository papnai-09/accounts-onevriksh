"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations/auth";
import { resetPasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { useToast } from "@/components/ui/toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "mock_token";
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const watched = watch("password", "");
  React.useEffect(() => setPasswordValue(watched || ""), [watched]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      const res = await resetPasswordAction(data);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        toast({ type: "error", title: "Reset failed", description: res.error });
      }
    } catch {
      toast({ type: "error", title: "Something went wrong", description: "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-10 shadow-xl backdrop-blur-xl text-center">
          <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Password Reset!</h1>
          <p className="mt-3 text-sm text-slate-500">
            Your password has been successfully updated. Redirecting to sign in…
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-8 text-left">
          <div className="mb-6 flex justify-start">
            <img src="/logo-short.png" alt="Onevriksh Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Reset Password
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500 dark:text-slate-400">
            Create a new password for your Onevriksh Account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register("token")} value={token} />

          <Input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordStrengthMeter password={passwordValue} />

          <Input
            id="reset-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} className="text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} id="reset-submit">
            Update Password
          </Button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="w-full max-w-md p-8 text-center text-slate-500">Loading...</div>}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
