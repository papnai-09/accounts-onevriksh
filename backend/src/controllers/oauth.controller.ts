import { Response, NextFunction } from "express";
import { ClientService } from "../services/client.service.js";
import { ConsentService } from "../services/consent.service.js";
import { OAuthService } from "../services/oauth.service.js";
import { AuditService } from "../services/audit.service.js";
import { sendOAuthError } from "../utils/response.util.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const clientService = new ClientService();
const consentService = new ConsentService();
const oauthService = new OAuthService();
const auditService = new AuditService();

export class OAuthController {
  async authorize(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        client_id,
        redirect_uri,
        response_type,
        scope = "openid profile email",
        state,
        code_challenge,
        code_challenge_method,
        nonce,
      } = req.query as any;

      if (response_type !== "code") {
        return sendOAuthError(res, 400, "unsupported_response_type", "OAuth 2.1 requires response_type=code");
      }

      if (code_challenge_method !== "S256" || !code_challenge) {
        return sendOAuthError(res, 400, "invalid_request", "PKCE code_challenge and code_challenge_method=S256 are required");
      }

      // Validate Client
      const client = await clientService.getClientByClientId(client_id);
      if (!client || client.status !== "ACTIVE") {
        return sendOAuthError(res, 400, "invalid_client", "Client application not found or inactive");
      }

      // Validate Redirect URI (Exact Match)
      if (!client.redirectUris.includes(redirect_uri)) {
        return sendOAuthError(res, 400, "invalid_grant", "Redirect URI not registered for this client");
      }

      // If user is unauthenticated -> return status indicating login is required
      if (!req.user) {
        return res.status(200).json({
          authenticated: false,
          client: {
            clientId: client.clientId,
            clientName: client.clientName,
            logoUrl: client.logoUrl,
          },
        });
      }

      // User is authenticated! Check Consent
      const requestedScopes = scope.split(" ");
      const hasConsent = await consentService.hasConsent(req.user._id.toString(), client_id, requestedScopes);

      if (!hasConsent) {
        return res.status(200).json({
          authenticated: true,
          consentRequired: true,
          client: {
            clientId: client.clientId,
            clientName: client.clientName,
            logoUrl: client.logoUrl,
          },
          scopes: requestedScopes,
        });
      }

      // Consent granted or first-party app! Issue PKCE Authorization Code
      const authCode = await oauthService.createAuthorizationCode(
        client_id,
        req.user._id.toString(),
        redirect_uri,
        scope,
        code_challenge,
        code_challenge_method,
        nonce
      );

      const ip = req.ip || "127.0.0.1";
      await auditService.logEvent("OAUTH_AUTHORIZE", "SUCCESS", ip, req.headers["user-agent"], req.user._id.toString(), client_id);

      res.status(200).json({
        authenticated: true,
        consentRequired: false,
        code: authCode,
        redirectUri: `${redirect_uri}?code=${authCode}&state=${encodeURIComponent(state)}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async processConsent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method, nonce, approved } = req.body;

      if (!approved) {
        return res.status(200).json({
          approved: false,
          redirectUri: `${redirect_uri}?error=access_denied&state=${encodeURIComponent(state)}`,
        });
      }

      const requestedScopes = scope.split(" ");
      await consentService.grantConsent(req.user._id.toString(), client_id, requestedScopes);

      const authCode = await oauthService.createAuthorizationCode(
        client_id,
        req.user._id.toString(),
        redirect_uri,
        scope,
        code_challenge,
        code_challenge_method,
        nonce
      );

      res.status(200).json({
        approved: true,
        code: authCode,
        redirectUri: `${redirect_uri}?code=${authCode}&state=${encodeURIComponent(state)}`,
      });
    } catch (error) {
      next(error);
    }
  }
}
