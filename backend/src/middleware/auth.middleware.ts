import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/session.service.js";
import { OAuthService } from "../services/oauth.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { sendOAuthError } from "../utils/response.util.js";

const sessionService = new SessionService();
const oauthService = new OAuthService();
const userRepo = new UserRepository();

export interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
  tokenClaims?: any;
}

/**
 * Require valid HTTP-only session cookie (for web dashboard & authorize consent page)
 */
export async function requireUserSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const rawToken = req.cookies?.onevriksh_session;
  if (!rawToken) {
    return res.status(401).json({ error: "unauthorized", message: "Session token required" });
  }

  const session = await sessionService.validateSessionToken(rawToken);
  if (!session) {
    res.clearCookie("onevriksh_session");
    return res.status(401).json({ error: "unauthorized", message: "Session expired or invalid" });
  }

  const user = await userRepo.findById(session.userId.toString());
  if (!user || user.isBlocked || user.status === "BLOCKED") {
    res.clearCookie("onevriksh_session");
    return res.status(401).json({ error: "unauthorized", message: "User account suspended" });
  }

  req.session = session;
  req.user = user;
  next();
}

/**
 * Optional user session middleware (attaches session if cookie exists)
 */
export async function optionalUserSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const rawToken = req.cookies?.onevriksh_session;
  if (rawToken) {
    const session = await sessionService.validateSessionToken(rawToken);
    if (session) {
      const user = await userRepo.findById(session.userId.toString());
      if (user && !user.isBlocked) {
        req.session = session;
        req.user = user;
      }
    }
  }
  next();
}

/**
 * Require valid Bearer Access Token (for /userinfo & protected OAuth APIs)
 */
export async function requireBearerToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendOAuthError(res, 401, "invalid_token", "Bearer token required");
  }

  const token = authHeader.substring(7);
  try {
    const claims = await oauthService.verifyAccessToken(token);
    const user = await userRepo.findById(claims.sub as string);
    if (!user) {
      return sendOAuthError(res, 401, "invalid_token", "User not found");
    }

    req.user = user;
    req.tokenClaims = claims;
    next();
  } catch (err: any) {
    return sendOAuthError(res, 401, "invalid_token", err.message || "Token invalid or expired");
  }
}
