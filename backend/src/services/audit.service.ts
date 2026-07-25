import { AuditRepository } from "../repositories/audit.repository.js";

export class AuditService {
  private auditRepo = new AuditRepository();

  async logEvent(
    eventType: string,
    status: "SUCCESS" | "FAILURE",
    ipAddress: string,
    userAgent?: string,
    userId?: string,
    clientId?: string,
    details?: Record<string, any>
  ) {
    try {
      await this.auditRepo.log({
        eventType,
        status,
        ipAddress,
        userAgent,
        userId: userId ? (userId as any) : undefined,
        clientId,
        details,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  }

  async getUserAuditLogs(userId: string) {
    return this.auditRepo.findByUserId(userId);
  }
}
