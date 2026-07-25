import { Request, Response } from "express";
import { OAuthService } from "../services/oauth.service.js";
import { sendOAuthError } from "../utils/response.util.js";

const oauthService = new OAuthService();

export class RevocationController {
  async revoke(req: Request, res: Response) {
    const { token } = req.body;
    if (!token) {
      return sendOAuthError(res, 400, "invalid_request", "token parameter is required");
    }

    await oauthService.revokeToken(token);
    res.status(200).json({ status: "revoked" });
  }
}
