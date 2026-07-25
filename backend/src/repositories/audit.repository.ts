import { AuditLog, IAuditLog } from "../models/AuditLog.js";

export class AuditRepository {
  async log(entry: Partial<IAuditLog>): Promise<IAuditLog> {
    return AuditLog.create(entry);
  }

  async findByUserId(userId: string, limit: number = 50): Promise<IAuditLog[]> {
    return AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(limit);
  }
}
