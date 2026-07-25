import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined = req.cookies?.onevriksh_access;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, error: "Invalid or expired access token" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Authentication failed" });
  }
}
