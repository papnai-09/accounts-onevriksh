import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { SessionService } from "../services/session.service.js";
import { AuditService } from "../services/audit.service.js";

const authService = new AuthService();
const sessionService = new SessionService();
const auditService = new AuditService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      const ip = req.ip || "127.0.0.1";
      const ua = req.headers["user-agent"];

      const { rawToken } = await sessionService.createSession(user._id.toString(), ip, ua);

      res.cookie("onevriksh_session", rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      await auditService.logEvent("USER_REGISTER", "SUCCESS", ip, ua, user._id.toString());

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || "127.0.0.1";
      const ua = req.headers["user-agent"];

      const user = await authService.login(req.body);
      const { rawToken } = await sessionService.createSession(user._id.toString(), ip, ua);

      res.cookie("onevriksh_session", rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      await auditService.logEvent("USER_LOGIN", "SUCCESS", ip, ua, user._id.toString());

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: any) {
      const ip = req.ip || "127.0.0.1";
      const ua = req.headers["user-agent"];
      await auditService.logEvent("USER_LOGIN", "FAILURE", ip, ua, undefined, undefined, {
        email: req.body.email,
        reason: error.message,
      });
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("onevriksh_session");
    res.status(200).json({ success: true, message: "Logged out" });
  }

  async getCurrentUser(req: any, res: Response) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  }
}
