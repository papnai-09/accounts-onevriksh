import crypto from "node:crypto";

export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateAuthCode(): string {
  return "code_" + crypto.randomBytes(24).toString("hex");
}

export function generateRefreshToken(): string {
  return "rft_" + crypto.randomBytes(32).toString("hex");
}

export function generateFamilyId(): string {
  return "fam_" + crypto.randomBytes(16).toString("hex");
}

export function generateClientId(): string {
  return "client_" + crypto.randomBytes(12).toString("hex");
}

export function generateClientSecret(): string {
  return "secret_" + crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
