"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

interface WelcomeBannerProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  roles: string[];
}

export const WelcomeBanner = React.memo(function WelcomeBanner({
  firstName,
  lastName,
  email,
  avatarUrl,
  roles,
}: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-800 p-6 text-white shadow-lg shadow-brand-700/20"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Avatar name={`${firstName} ${lastName}`} src={avatarUrl} size="lg" className="border-white/30" />
          <div>
            <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl font-bold mt-0.5">{firstName} {lastName}</h1>
            <p className="text-brand-200 text-sm mt-0.5">{email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <span key={role} className="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {role.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
});
