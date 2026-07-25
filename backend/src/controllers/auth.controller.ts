import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export class AuthController {
  static async firebaseLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, phone, userData } = req.body;
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const ua = req.headers["user-agent"] || "Unknown";

      const result = await AuthService.firebaseLogin(idToken, phone, userData, ip, ua);

      res.cookie("onevriksh_access", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("onevriksh_refresh", result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const result = await AuthService.sendOtp(phone);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      const result = await AuthService.verifyOtp(phone, otp);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const ua = req.headers["user-agent"] || "Unknown";
      const result = await AuthService.register(req.body, ip, ua);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const ua = req.headers["user-agent"] || "Unknown";
      const result = await AuthService.login(req.body, ip, ua);

      res.cookie("onevriksh_access", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("onevriksh_refresh", result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: req.body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.onevriksh_refresh;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie("onevriksh_access", COOKIE_OPTIONS);
      res.clearCookie("onevriksh_refresh", COOKIE_OPTIONS);

      res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.onevriksh_refresh || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, error: "No refresh token provided." });
        return;
      }

      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const ua = req.headers["user-agent"] || "Unknown";

      const result = await AuthService.refreshTokens(refreshToken, ip, ua);

      res.cookie("onevriksh_access", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("onevriksh_refresh", result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ success: true, accessToken: result.accessToken });
    } catch (error) {
      next(error);
    }
  }
}
