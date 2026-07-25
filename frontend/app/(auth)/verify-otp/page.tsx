"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, RefreshCw, Edit3 } from "lucide-react";
import { verifyOtpAction, sendOtpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { OtpInput } from "@/components/auth/otp-input";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPhone = searchParams.get("phone") || "";
  const { toast } = useToast();

  const [otp, setOtp] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [timer, setTimer] = React.useState(45);

  const formattedPhone = React.useMemo(() => {
    if (!rawPhone) return "your mobile number";
    const cleaned = rawPhone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return rawPhone;
  }, [rawPhone]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (codeToVerify: string = otp) => {
    if (codeToVerify.length !== 6) {
      toast({ type: "error", title: "Invalid OTP", description: "Please enter a 6-digit verification code." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtpAction({ phone: rawPhone, otp: codeToVerify });
      if (res.success) {
        toast({
          type: "success",
          title: "Account Created & Verified! 🎉",
          description: "Your Onevriksh account has been created successfully. Redirecting to sign in...",
        });
        setTimeout(() => router.push("/login"), 1000);
      } else {
        toast({ type: "error", title: "Verification Failed", description: res.error || "Invalid OTP code." });
      }
    } catch {
      toast({ type: "error", title: "Something went wrong", description: "Please check your network and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await sendOtpAction(rawPhone);
      if (res.success) {
        toast({
          type: "info",
          title: "OTP Resent Successfully 📱",
          description: `A new 6-digit code has been sent to ${formattedPhone}.`,
        });
        setOtp("");
        setTimer(45);
      } else {
        toast({ type: "error", title: "Resend Failed", description: res.error });
      }
    } catch {
      toast({ type: "error", title: "Failed to resend", description: "Please try again in a moment." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 p-8 shadow-2xl shadow-brand-500/10 backdrop-blur-xl">
        {/* Top Header Logo */}
        <div className="mb-6 flex items-center justify-between">
          <img src="/logo-short.png" alt="Onevriksh Logo" className="h-10 w-auto object-contain" />
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            2FA Secured
          </span>
        </div>

        {/* Title */}
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Verify Mobile Number
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter the 6-digit code sent via SMS to
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-wide">
              {formattedPhone}
            </span>
            <Link
              href="/register"
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold inline-flex items-center gap-0.5 hover:underline"
              title="Edit mobile number"
            >
              <Edit3 className="h-3 w-3" /> Edit
            </Link>
          </div>
        </div>

        {/* 6-Digit OTP Box Component */}
        <div className="space-y-6">
          <OtpInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={(completeCode) => handleVerify(completeCode)}
            disabled={isLoading}
          />

          {/* Resend Timer & Button */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Didn't get the SMS?</span>
            <button
              type="button"
              onClick={onResend}
              disabled={timer > 0 || isResending}
              className={`font-bold inline-flex items-center gap-1.5 transition-all ${
                timer > 0 || isResending
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
              }`}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending...
                </>
              ) : timer > 0 ? (
                `Resend code in ${timer}s`
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
                </>
              )}
            </button>
          </div>

          {/* Manual Submit Button */}
          <Button
            type="button"
            variant="primary"
            className="w-full h-12 text-base font-bold shadow-lg shadow-brand-500/20"
            isLoading={isLoading}
            onClick={() => handleVerify()}
            disabled={otp.length !== 6 || isLoading}
            id="otp-submit"
          >
            Verify & Continue
          </Button>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense fallback={<div className="w-full max-w-md p-8 text-center text-slate-500">Loading verification...</div>}>
      <VerifyOtpForm />
    </React.Suspense>
  );
}
