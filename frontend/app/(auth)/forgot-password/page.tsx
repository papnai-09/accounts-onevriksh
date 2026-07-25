"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Phone, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const res = await forgotPasswordAction(data);
      if (res.success) {
        toast({ type: "success", title: "OTP Sent!", description: "A 6-digit verification code was sent to your mobile number." });
        setTimeout(() => router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`), 800);
      } else {
        toast({ type: "error", title: "Request failed", description: res.error });
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
            Forgot Password
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500 dark:text-slate-400">
            Enter your mobile number to receive a 6-digit OTP
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            type="tel"
            id="forgot-phone"
            placeholder="Mobile number"
            autoComplete="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} id="forgot-submit">
            Send OTP
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
