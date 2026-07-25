"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HomeClient() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/images/ecosystem_security.jpg"
          alt="onevriksh Ecosystem"
          className="w-full h-full object-cover"
        />
        {/* Overlay for text readability with light blue tint and more blur */}
        <div className="absolute inset-0 bg-brand-50/75 dark:bg-slate-950/75 backdrop-blur-sm" />
        
        {/* Top and Bottom gradient fades with light blue */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-100/50 via-transparent to-white dark:from-brand-950/50 dark:via-transparent dark:to-slate-950" />
      </div>

      {/* Hero Content Section */}
      <section className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col justify-center">
        <div className="mx-auto max-w-5xl text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
          >
            Your Trusted Identity Across{" "}
            <span className="text-brand-700 dark:text-brand-500">
              Onevriksh
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-semibold drop-shadow-sm"
          >
            Sign in once and access the entire Onevriksh ecosystem with confidence. From learning and travel to commerce and business solutions, your account keeps everything connected, secure, and simple.
          </motion.p>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="/register"
              className="group inline-flex items-center space-x-2.5 rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-600/40 transition-all hover:scale-105 active:scale-95"
            >
              <span>Create Your Account</span>
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
