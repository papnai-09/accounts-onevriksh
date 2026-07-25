import { VerificationToken } from "../models/VerificationToken.js";
import { generateRandomToken } from "../utils/session.js";
import { generateAccessToken } from "../utils/jwt.js";

export class SsoService {
  static isAllowedRedirectDomain(urlStr: string): boolean {
    if (!urlStr) return false;
    try {
      const url = new URL(urlStr);
      const host = url.hostname;
      const allowedDomains = [
        "onevriksh.in",
        "accounts.onevriksh.in",
        "study.onevriksh.in",
        "travel.onevriksh.in",
        "crm.onevriksh.in",
        "academy.onevriksh.in",
        "localhost",
        "127.0.0.1",
      ];
      return allowedDomains.some((d) => host === d || host.endsWith("." + d));
    } catch {
      return false;
    }
  }

  static async createAuthorizationCode(userId: string, email: string, roles: string[], redirectUri: string) {
    if (!this.isAllowedRedirectDomain(redirectUri)) {
      throw new Error("Unauthorized redirect URL.");
    }

    const code = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await VerificationToken.create({
      userId,
      token: code,
      expiresAt,
    });

    return code;
  }

  static async exchangeCodeForToken(code: string) {
    const record = await VerificationToken.findOne({ token: code });
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Invalid or expired authorization code.");
    }

    await VerificationToken.deleteOne({ _id: record._id });

    const accessToken = await generateAccessToken({
      userId: record.userId?.toString() || "",
      email: "",
      roles: ["CUSTOMER"],
      isEmailVerified: true,
    });

    return { accessToken, tokenType: "Bearer", expiresIn: 900 };
  }
}
