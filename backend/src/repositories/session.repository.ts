import { Session, ISession } from "../models/Session.js";

export class SessionRepository {
  async create(data: Partial<ISession>): Promise<ISession> {
    return Session.create(data);
  }

  async findByTokenHash(tokenHash: string): Promise<ISession | null> {
    return Session.findOne({ sessionTokenHash: tokenHash, isActive: true });
  }

  async findActiveByUserId(userId: string): Promise<ISession[]> {
    return Session.find({ userId, isActive: true }).sort({ lastActivity: -1 });
  }

  async updateLastActivity(id: string): Promise<void> {
    await Session.findByIdAndUpdate(id, { lastActivity: new Date() });
  }

  async terminateSession(id: string, userId: string): Promise<boolean> {
    const result = await Session.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async terminateAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const result = await Session.updateMany(
      { userId, _id: { $ne: currentSessionId }, isActive: true },
      { isActive: false }
    );
    return result.modifiedCount;
  }

  async terminateAllUserSessions(userId: string): Promise<number> {
    const result = await Session.updateMany({ userId, isActive: true }, { isActive: false });
    return result.modifiedCount;
  }
}
