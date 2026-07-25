import { Request, Response } from "express";
import { jwtConfig } from "../config/jwt.js";

export class OidcController {
  getDiscoveryDocument(_req: Request, res: Response) {
    const issuer = jwtConfig.issuer;
    res.status(200).json({
      issuer,
      authorization_endpoint: `${issuer}/api/oauth/authorize`,
      token_endpoint: `${issuer}/api/oauth/token`,
      userinfo_endpoint: `${issuer}/api/oauth/userinfo`,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      revocation_endpoint: `${issuer}/api/oauth/revoke`,
      introspection_endpoint: `${issuer}/api/oauth/introspect`,
      end_session_endpoint: `${issuer}/api/oauth/logout`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "profile", "email", "offline_access"],
      token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post", "none"],
      claims_supported: [
        "iss",
        "sub",
        "aud",
        "exp",
        "iat",
        "auth_time",
        "nonce",
        "email",
        "email_verified",
        "name",
        "given_name",
        "family_name",
        "picture",
        "preferred_username",
      ],
      code_challenge_methods_supported: ["S256"],
    });
  }
}
