import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { SsoService } from "../services/sso.service.js";

export class SsoController {
  static async createAuthorizationCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { redirectUri } = req.body;
      const code = await SsoService.createAuthorizationCode(
        req.user!.userId,
        req.user!.email,
        req.user!.roles,
        redirectUri
      );
      res.status(200).json({ success: true, code });
    } catch (error) {
      next(error);
    }
  }

  static async exchangeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const result = await SsoService.exchangeCodeForToken(code);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
