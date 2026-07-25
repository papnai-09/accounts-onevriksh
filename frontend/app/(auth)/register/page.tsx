"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Phone } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await registerAction(data);
      if (res.success) {
        toast({ type: "info", title: "OTP Sent! 📱", description: "Please verify the 6-digit code sent to your mobile number to complete account creation." });
        setTimeout(() => router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`), 600);
      } else {
        toast({ type: "error", title: "Registration failed", description: res.error });
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
            Create Account
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500 dark:text-slate-400">
            Create your Onevriksh Account to get started
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              id="register-firstname"
              placeholder="First name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              type="text"
              id="register-lastname"
              placeholder="Last name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <Input
            type="text"
            id="register-username"
            placeholder="Username"
            autoComplete="username"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            type="tel"
            id="register-phone"
            placeholder="Mobile number"
            autoComplete="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            type={showPassword ? "text" : "password"}
            id="register-password"
            placeholder="Password"
            autoComplete="new-password"
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

          <Input
            type={showConfirmPassword ? "text" : "password"}
            id="register-confirmpassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="space-y-2 pt-1">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                id="register-terms"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-brand-700 accent-brand-700"
                {...register("acceptedTerms")}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-brand-700 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-brand-700 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.acceptedTerms?.message && (
              <p className="text-xs text-rose-500 font-medium">{errors.acceptedTerms.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} id="register-submit">
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
