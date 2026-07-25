import { Response } from "express";
import { OidcService } from "../services/oidc.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const oidcService = new OidcService();

export class UserInfoController {
  getUserInfo(req: AuthenticatedRequest, res: Response) {
    const scope = req.tokenClaims?.scope || "openid profile email";
    const claims = oidcService.getUserInfoClaims(req.user, scope);
    res.status(200).json(claims);
  }
}
