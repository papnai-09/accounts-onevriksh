import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import ConnectedApp from "@/models/ConnectedApp";
import VerificationToken from "@/models/VerificationToken";
import { generateRandomToken } from "@/lib/auth/session";
import { generateAccessToken } from "@/lib/auth/jwt";

export class SsoService {
  /**
   * Verify target SSO return URL domain
   */
  static isAllowedRedirectDomain(urlStr: string): boolean {
    if (!urlStr) return false;
    try {
      const url = new URL(urlStr);
      const host = url.hostname;
      // Allow official OneVriksh domains
      const allowedDomains = [
        "onevriksh.in",
        "accounts.onevriksh.in",
        "study.onevriksh.in",
        "travel.onevriksh.in",
        "crm.onevriksh.in",
        "academy.onevriksh.in",
        "blog.onevriksh.in",
        "visa.onevriksh.in",
        "hotels.onevriksh.in",
        "jobs.onevriksh.in",
        "admin.onevriksh.in",
        "partner.onevriksh.in",
        "developer.onevriksh.in",
        "localhost",
        "127.0.0.1",
      ];
      return allowedDomains.some((d) => host === d || host.endsWith("." + d));
    } catch {
      return false;
    }
  }

  /**
   * Create an SSO Authorization Code for cross-domain redirect
   */
  static async createAuthorizationCode(userId: string, email: string, roles: string[], redirectUri: string) {
    await connectToDatabase();
    if (!this.isAllowedRedirectDomain(redirectUri)) {
      throw new Error("Unauthorized redirect URL.");
    }

    const code = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await VerificationToken.create({
      userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
      identifier: `${userId}:${email}`,
      token: code,
      type: "EMAIL_VERIFICATION", // Used as single-use exchange token
      expiresAt,
    });

    return code;
  }

  /**
   * Exchange SSO Authorization Code for Access Token
   */
  static async exchangeCodeForToken(code: string) {
    await connectToDatabase();
    const record = await VerificationToken.findOne({ token: code });
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Invalid or expired authorization code.");
    }

    const [userId, email] = (record.identifier || "").split(":");
    await VerificationToken.deleteOne({ _id: record._id });

    const accessToken = await generateAccessToken({
      userId,
      email,
      roles: ["CUSTOMER"],
      isEmailVerified: true,
    });

    return { accessToken, tokenType: "Bearer", expiresIn: 900 };
  }
}
