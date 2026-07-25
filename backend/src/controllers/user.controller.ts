import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { UserService } from "../services/user.service.js";

export class UserController {
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, error: "User not found." });
        return;
      }
      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserService.updateProfile(req.user!.userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const ua = req.headers["user-agent"] || "Unknown";
      const result = await UserService.changePassword(req.user!.userId, req.body, ip, ua);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserService.deactivateAccount(req.user!.userId, req.body.password);
      res.clearCookie("onevriksh_access");
      res.clearCookie("onevriksh_refresh");
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserService.deleteAccount(req.user!.userId, req.body.password);
      res.clearCookie("onevriksh_access");
      res.clearCookie("onevriksh_refresh");
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async exportUserData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await UserService.exportUserData(req.user!.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
