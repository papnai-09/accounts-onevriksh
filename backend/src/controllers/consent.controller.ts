import { Response, NextFunction } from "express";
import { ConsentService } from "../services/consent.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const consentService = new ConsentService();

export class ConsentController {
  async getConnectedApps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const apps = await consentService.getUserConnectedApps(req.user._id.toString());
      res.status(200).json({ success: true, connectedApps: apps });
    } catch (error) {
      next(error);
    }
  }

  async revokeConsent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      await consentService.revokeConsent(req.user._id.toString(), clientId);
      res.status(200).json({ success: true, message: "Consent revoked" });
    } catch (error) {
      next(error);
    }
  }
}
