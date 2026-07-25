"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface PasswordStrengthMeterProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "bg-slate-200 dark:bg-slate-800" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-rose-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 4) return { score, label: "Good", color: "bg-sky-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

const REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label, color } = getStrength(password);
  const MAX_SCORE = 6;
  const widthPct = password ? `${Math.max((score / MAX_SCORE) * 100, 10)}%` : "0%";

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: widthPct }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>

      {/* Label */}
      {label && (
        <p className={`text-xs font-semibold ${color.replace("bg-", "text-")}`}>
          Password strength: {label}
        </p>
      )}

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        {REQUIREMENTS.map(({ label: req, test }) => {
          const passed = test(password);
          return (
            <div key={req} className="flex items-center space-x-1.5">
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${passed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
              <span className={`text-xs ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                {req}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
