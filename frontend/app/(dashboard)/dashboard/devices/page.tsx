"use client";

import * as React from "react";
import { Laptop, Smartphone, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrustedDevicesPage() {
  const [devices] = React.useState([
    {
      id: "dev-1",
      deviceName: "Chrome on Windows 11",
      ipAddress: "203.0.113.195",
      location: "India",
      lastUsed: "Just now",
      trustedAt: "2026-07-25",
    },
  ]);

  return (
    <div className="space-y-8 p-6 text-slate-100">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          Trusted Devices
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Devices registered to bypass multi-factor prompts for seamless Single Sign-On.
        </p>
      </div>

      <div className="grid gap-4">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Laptop className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{dev.deviceName}</h3>
                <p className="text-xs text-slate-400">
                  {dev.location} ({dev.ipAddress}) • Trusted since {dev.trustedAt}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 text-slate-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Remove Trust
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
