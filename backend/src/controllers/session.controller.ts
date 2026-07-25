import { Response, NextFunction } from "express";
import { SessionService } from "../services/session.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const sessionService = new SessionService();

export class SessionController {
  async getActiveSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const currentSessionId = req.session?._id?.toString();
      const sessions = await sessionService.getUserSessions(req.user._id.toString(), currentSessionId);
      res.status(200).json({ success: true, sessions });
    } catch (error) {
      next(error);
    }
  }

  async terminateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.sessionId as string;
      const success = await sessionService.terminateSession(req.user._id.toString(), sessionId);
      res.status(200).json({ success, message: "Session terminated" });
    } catch (error) {
      next(error);
    }
  }

  async terminateOtherSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const currentSessionId = req.session._id.toString();
      const count = await sessionService.terminateAllOtherSessions(req.user._id.toString(), currentSessionId);
      res.status(200).json({ success: true, terminatedCount: count });
    } catch (error) {
      next(error);
    }
  }
}
