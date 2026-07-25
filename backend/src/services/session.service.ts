import { Session } from "../models/Session.js";
import { LoginHistory } from "../models/LoginHistory.js";
import { SecurityEvent } from "../models/SecurityEvent.js";
import { RefreshToken } from "../models/RefreshToken.js";

export class SessionService {
  static async getActiveSessions(userId: string, currentSessionId?: string) {
    const sessions = await Session.find({
      userId,
      isValid: true,
      expiresAt: { $gt: new Date() },
    }).sort({ updatedAt: -1 }).lean();

    return (sessions as any[]).map((s) => ({
      id: String(s._id),
      browser: s.browser,
      os: s.os,
      device: s.device,
      ipAddress: s.ipAddress,
      isCurrent: currentSessionId ? String(s._id) === currentSessionId : s.isCurrent,
      lastActiveAt: s.updatedAt,
      createdAt: s.createdAt,
    }));
  }

  static async revokeSession(userId: string, sessionId: string) {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) throw new Error("Session not found.");

    session.isValid = false;
    await session.save();

    await SecurityEvent.create({
      userId,
      eventType: "SESSION_REVOKED",
      description: `Session revoked for ${session.browser} on ${session.os}`,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    });

    return { success: true, message: "Session revoked successfully." };
  }

  static async logoutOtherDevices(userId: string, currentSessionId?: string) {
    const query: Record<string, any> = { userId, isValid: true };
    if (currentSessionId) {
      query._id = { $ne: currentSessionId };
    }

    await Session.updateMany(query, { isValid: false });
    await RefreshToken.updateMany({ userId }, { isRevoked: true });

    await SecurityEvent.create({
      userId,
      eventType: "SESSION_REVOKED",
      description: "Revoked all other active sessions across devices",
      ipAddress: "127.0.0.1",
      userAgent: "Security Dashboard",
    });

    return { success: true, message: "All other sessions have been logged out." };
  }

  static async getLoginHistory(userId: string, limit: number = 20) {
    const history = await LoginHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return (history as any[]).map((h) => ({
      id: String(h._id),
      status: h.status,
      browser: h.browser,
      os: h.os,
      device: h.device,
      ipAddress: h.ipAddress,
      createdAt: h.createdAt,
    }));
  }
}
