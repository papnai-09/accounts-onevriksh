import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { SessionService } from "../services/session.service.js";

export class SessionController {
  static async getActiveSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await SessionService.getActiveSessions(req.user!.userId);
      res.status(200).json({ success: true, sessions });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = String(req.params.id);
      const result = await SessionService.revokeSession(req.user!.userId, sessionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logoutOtherDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SessionService.logoutOtherDevices(req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 20;
      const history = await SessionService.getLoginHistory(req.user!.userId, limit);
      res.status(200).json({ success: true, history });
    } catch (error) {
      next(error);
    }
  }
}
