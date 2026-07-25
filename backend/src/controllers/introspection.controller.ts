import { Request, Response } from "express";
import { OAuthService } from "../services/oauth.service.js";
import { sendOAuthError } from "../utils/response.util.js";

const oauthService = new OAuthService();

export class IntrospectionController {
  async introspect(req: Request, res: Response) {
    const { token } = req.body;
    if (!token) {
      return sendOAuthError(res, 400, "invalid_request", "token parameter is required");
    }

    const result = await oauthService.introspectToken(token);
    res.status(200).json(result);
  }
}
