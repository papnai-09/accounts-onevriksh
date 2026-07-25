/**
 * Expected Environment Variables:
 * - JWT_ACCESS_SECRET
 * - JWT_REFRESH_SECRET
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET || "onevriksh_access_secret_default_development_min_32_chars";
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET || "onevriksh_refresh_secret_default_development_min_32_chars";
  return new TextEncoder().encode(secret);
}

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  isEmailVerified: boolean;
}

export async function generateAccessToken(payload: Omit<TokenPayload, "iat" | "exp" | "jti">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setIssuer("accounts.onevriksh.in")
    .setAudience("onevriksh-ecosystem")
    .sign(getAccessSecret());
}

export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setIssuer("accounts.onevriksh.in")
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      issuer: "accounts.onevriksh.in",
      audience: "onevriksh-ecosystem",
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      issuer: "accounts.onevriksh.in",
    });
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}
