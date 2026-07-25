"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import {
  loginSchema, RegisterInput,
  forgotPasswordSchema, ForgotPasswordInput,
  resetPasswordSchema, ResetPasswordInput,
  updateProfileSchema, UpdateProfileInput,
  LoginInput, verifyOtpSchema, VerifyOtpInput
} from "@/lib/validations/auth";
import { verifyAccessToken } from "@/lib/auth/jwt";

function getClientIp(req: Headers): string {
  return (
    req.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.get("x-real-ip") ||
    "unknown"
  );
}

export async function firebaseLoginAction(
  idToken: string,
  phone: string,
  userData?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const headerStore = await headers();
    const ip = getClientIp(headerStore);
    const ua = headerStore.get("user-agent") || "Unknown";

    const result = await AuthService.firebaseLogin(idToken, phone, userData, ip, ua);
    if (result.success && result.accessToken && result.refreshToken) {
      const cookieStore = await cookies();
      setAuthCookies(cookieStore, result.accessToken, result.refreshToken, true);
    }
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Firebase authentication failed." };
  }
}

export async function registerAction(data: RegisterInput): Promise<{ success: boolean; error?: string }> {
  try {
    const headerStore = await headers();
    const ip = getClientIp(headerStore);
    const ua = headerStore.get("user-agent") || "Unknown";

    await AuthService.register(data, ip, ua);
    if (data.phone) {
      await AuthService.sendOtp(data.phone);
    }
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function loginAction(data: LoginInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = loginSchema.parse(data);
    const headerStore = await headers();
    const ip = getClientIp(headerStore);
    const ua = headerStore.get("user-agent") || "Unknown";

    const result = await AuthService.login(validated, ip, ua);
    if (result.success && result.accessToken && result.refreshToken) {
      const cookieStore = await cookies();
      setAuthCookies(cookieStore, result.accessToken, result.refreshToken, validated.rememberMe);
    }
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: "Invalid input" };
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("onevriksh_refresh")?.value;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    clearAuthCookies(cookieStore);
    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function sendOtpAction(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    await AuthService.sendOtp(phone);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to send OTP." };
  }
}

export async function verifyOtpAction(data: VerifyOtpInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = verifyOtpSchema.parse(data);
    await AuthService.verifyOtp(validated.phone, validated.otp);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: "Invalid OTP format." };
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "OTP verification failed." };
  }
}

export async function forgotPasswordAction(data: ForgotPasswordInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = forgotPasswordSchema.parse(data);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: "Invalid mobile number." };
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to process request." };
  }
}

export async function resetPasswordAction(data: ResetPasswordInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = resetPasswordSchema.parse(data);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: "Invalid input" };
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Password reset failed." };
  }
}

export async function updateProfileAction(data: UpdateProfileInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateProfileSchema.parse(data);
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("onevriksh_access")?.value;
    if (!accessToken) return { success: false, error: "Not authenticated." };

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) return { success: false, error: "Session expired. Please sign in again." };

    await UserService.updateProfile(decoded.userId, validated);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: "Invalid input" };
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Profile update failed." };
  }
}

export async function refreshTokenAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const refreshTokenValue = cookieStore.get("onevriksh_refresh")?.value;
    if (!refreshTokenValue) return { success: false, error: "No refresh token." };

    const headerStore = await headers();
    const ip = getClientIp(headerStore);
    const ua = headerStore.get("user-agent") || "Unknown";

    const { accessToken, refreshToken } = await AuthService.refreshTokens(refreshTokenValue, ip, ua);
    
    setAuthCookies(cookieStore, accessToken, refreshToken, true);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to refresh session." };
  }
}
