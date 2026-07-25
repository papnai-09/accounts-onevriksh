import { SessionRepository } from "../repositories/session.repository.js";
import { parseUserAgent } from "../utils/uaParser.util.js";
import { getCountryFromIp } from "../utils/geoIp.util.js";
import { generateRandomToken, hashToken } from "../utils/tokens.util.js";

export class SessionService {
  private sessionRepo = new SessionRepository();

  async createSession(userId: string, ipAddress: string, userAgent?: string) {
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const { browser, os, deviceName } = parseUserAgent(userAgent);
    const country = getCountryFromIp(ipAddress);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session

    const session = await this.sessionRepo.create({
      userId: userId as any,
      sessionTokenHash: tokenHash,
      ipAddress,
      userAgent,
      browser,
      os,
      deviceName,
      country,
      lastActivity: new Date(),
      expiresAt,
      isActive: true,
    });

    return { session, rawToken };
  }

  async validateSessionToken(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session || new Date() > session.expiresAt) {
      return null;
    }
    // Update last activity
    await this.sessionRepo.updateLastActivity(session._id.toString());
    return session;
  }

  async getUserSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.sessionRepo.findActiveByUserId(userId);
    return sessions.map((s) => ({
      id: s._id.toString(),
      browser: s.browser,
      os: s.os,
      deviceName: s.deviceName,
      ipAddress: s.ipAddress,
      country: s.country,
      lastActivity: s.lastActivity,
      isCurrent: currentSessionId ? s._id.toString() === currentSessionId : false,
    }));
  }

  async terminateSession(userId: string, sessionId: string) {
    return this.sessionRepo.terminateSession(sessionId, userId);
  }

  async terminateAllOtherSessions(userId: string, currentSessionId: string) {
    return this.sessionRepo.terminateAllOtherSessions(userId, currentSessionId);
  }

  async terminateAllUserSessions(userId: string) {
    return this.sessionRepo.terminateAllUserSessions(userId);
  }
}
