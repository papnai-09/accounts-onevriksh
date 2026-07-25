import * as z from "zod";

// ─── Login ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Username or phone is required")
    .max(255),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ─── Register ────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50).trim(),
    lastName: z.string().min(1, "Last name is required").max(50).trim(),
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_.-]{3,30}$/, "Username: 3-30 chars, letters, numbers, _ . -"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/\d/, "Must contain number")
      .regex(/[^a-zA-Z0-9]/, "Must contain special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptedTerms: z.boolean().refine((v) => v === true, "You must accept the terms"),
    newsletterSubscribed: z.boolean().optional().default(false),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Forgot Password ─────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid mobile number"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export const verifyOtpSchema = z.object({
  phone: z.string().min(1, "Mobile number is required"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// ─── Reset Password ──────────────────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/\d/, "Must contain number")
      .regex(/[^a-zA-Z0-9]/, "Must contain special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Change Password ─────────────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/\d/, "Must contain number")
      .regex(/[^a-zA-Z0-9]/, "Must contain special character"),
    confirmNewPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─── Update Profile ──────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_.-]{3,30}$/, "Username: 3-30 chars, letters, numbers, _ . -")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .optional()
    .default("PREFER_NOT_TO_SAY"),
  language: z.string().max(10).optional().default("en"),
  timezone: z.string().max(50).optional().default("UTC"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  occupation: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  socialLinks: z
    .object({
      github: z.string().optional().or(z.literal("")),
      linkedin: z.string().optional().or(z.literal("")),
      twitter: z.string().optional().or(z.literal("")),
      facebook: z.string().optional().or(z.literal("")),
      instagram: z.string().optional().or(z.literal("")),
    })
    .optional()
    .default({}),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── 2FA Setup ───────────────────────────────────────────────────────────────
export const verifyTotpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});
export type VerifyTotpInput = z.infer<typeof verifyTotpSchema>;
