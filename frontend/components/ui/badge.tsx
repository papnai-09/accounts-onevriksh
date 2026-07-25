import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "info" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  danger:
    "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  info:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400",
  outline:
    "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
