import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Setup invisible Recaptcha Verifier on element container
 */
export function setupRecaptcha(containerId: string = "recaptcha-container"): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("Recaptcha can only be initialized in browser environment.");
  }

  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      console.log("📱 [Firebase Recaptcha] Verified successfully.");
    },
    "expired-callback": () => {
      console.warn("⚠️ [Firebase Recaptcha] Expired. Please retry.");
    },
  });

  return window.recaptchaVerifier;
}

/**
 * Send real SMS OTP to user's mobile number via Firebase SMS Gateway
 */
export async function sendFirebaseSmsOtp(phone: string, containerId: string = "recaptcha-container"): Promise<ConfirmationResult> {
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
  const appVerifier = setupRecaptcha(containerId);

  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Verify SMS OTP code entered by user
 */
export async function confirmFirebaseSmsOtp(otpCode: string): Promise<{ idToken: string; user: any }> {
  if (!window.confirmationResult) {
    throw new Error("No active OTP request found. Please request a new OTP.");
  }

  const result = await window.confirmationResult.confirm(otpCode);
  const idToken = await result.user.getIdToken();

  return {
    idToken,
    user: result.user,
  };
}
