"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Metadata } from "next";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { rememberMe: true },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await loginAction(data);
      if (res.success) {
        toast({ type: "success", title: "Welcome back!", description: "Redirecting to your dashboard…" });
        setTimeout(() => router.push(returnUrl), 800);
      } else {
        toast({ type: "error", title: "Sign in failed", description: res.error });
      }
    } catch {
      toast({ type: "error", title: "Something went wrong", description: "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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
            Sign In
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500 dark:text-slate-400">
            Sign in to your Onevriksh Account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            type="text"
            id="login-identifier"
            placeholder="Username or Mobile number"
            autoComplete="username"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.identifier?.message}
            {...register("identifier")}
          />

          <Input
            type={showPassword ? "text" : "password"}
            id="login-password"
            placeholder="Password"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center space-x-2">
              <input
                type="checkbox"
                id="login-remember"
                className="h-4 w-4 rounded border-slate-300 bg-white text-brand-700 accent-brand-700"
                defaultChecked
                {...register("rememberMe")}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} id="login-submit">
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          New to Onevriksh?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400">
            Create an account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="w-full max-w-md p-8 text-center text-slate-500">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
