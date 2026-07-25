"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/verify-otp");
  }, [router]);

  return <div className="w-full max-w-md p-8 text-center text-slate-500">Redirecting to OTP Verification...</div>;
}
