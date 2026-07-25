import { Request, Response, NextFunction } from "express";
import { OAuthService } from "../services/oauth.service.js";
import { ClientService } from "../services/client.service.js";
import { sendOAuthError } from "../utils/response.util.js";

const oauthService = new OAuthService();
const clientService = new ClientService();

export class TokenController {
  async issueTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { grant_type, client_id, client_secret, code, redirect_uri, code_verifier, refresh_token } = req.body;

      // Validate Client Credentials
      const { valid, client } = await clientService.validateClientCredentials(client_id, client_secret);
      if (!valid || !client) {
        return sendOAuthError(res, 401, "invalid_client", "Client authentication failed");
      }

      if (grant_type === "authorization_code") {
        if (!code || !redirect_uri || !code_verifier) {
          return sendOAuthError(res, 400, "invalid_request", "code, redirect_uri, and code_verifier are required");
        }

        const tokenResult = await oauthService.exchangeCodeForTokens(
          code,
          code_verifier,
          client_id,
          redirect_uri
        );
        return res.status(200).json(tokenResult);
      } else if (grant_type === "refresh_token") {
        if (!refresh_token) {
          return sendOAuthError(res, 400, "invalid_request", "refresh_token is required");
        }

        const tokenResult = await oauthService.rotateRefreshToken(refresh_token, client_id);
        return res.status(200).json(tokenResult);
      } else {
        return sendOAuthError(res, 400, "unsupported_grant_type", "Only authorization_code and refresh_token are supported");
      }
    } catch (error: any) {
      if (error.code && error.description) {
        return sendOAuthError(res, 400, error.code, error.description);
      }
      next(error);
    }
  }
}
