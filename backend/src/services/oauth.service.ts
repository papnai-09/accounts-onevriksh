import * as jose from "jose";
import { AuthCodeRepository } from "../repositories/authCode.repository.js";
import { TokenRepository } from "../repositories/token.repository.js";
import { ClientService } from "./client.service.js";
import { OidcService } from "./oidc.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { verifyPkce } from "../utils/pkce.util.js";
import { getPrivateKey, getPublicKey } from "../config/jwks.js";
import { jwtConfig } from "../config/jwt.js";
import {
  generateAuthCode,
  generateRefreshToken,
  generateFamilyId,
  hashToken,
} from "../utils/tokens.util.js";

export class OAuthService {
  private authCodeRepo = new AuthCodeRepository();
  private tokenRepo = new TokenRepository();
  private clientService = new ClientService();
  private oidcService = new OidcService();
  private userRepo = new UserRepository();

  /**
   * Generates a short-lived PKCE Authorization Code (5 min TTL)
   */
  async createAuthorizationCode(
    clientId: string,
    userId: string,
    redirectUri: string,
    scope: string,
    codeChallenge: string,
    codeChallengeMethod: string,
    nonce?: string
  ) {
    const rawCode = generateAuthCode();
    const codeHash = hashToken(rawCode);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + jwtConfig.authCodeExpirySeconds);

    await this.authCodeRepo.create({
      codeHash,
      clientId,
      userId: userId as any,
      redirectUri,
      scope,
      codeChallenge,
      codeChallengeMethod,
      nonce,
      used: false,
      expiresAt,
    });

    return rawCode;
  }

  /**
   * Exchanges an Authorization Code for Access Token, Refresh Token, and OIDC ID Token
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
    clientId: string,
    redirectUri: string
  ) {
    const codeHash = hashToken(code);
    const authCodeDoc = await this.authCodeRepo.findByCodeHash(codeHash);

    if (!authCodeDoc) {
      throw { code: "invalid_grant", description: "Authorization code not found or expired" };
    }

    if (authCodeDoc.used) {
      throw { code: "invalid_grant", description: "Authorization code already used" };
    }

    if (new Date() > authCodeDoc.expiresAt) {
      throw { code: "invalid_grant", description: "Authorization code expired" };
    }

    if (authCodeDoc.clientId !== clientId) {
      throw { code: "invalid_grant", description: "Client ID mismatch" };
    }

    if (authCodeDoc.redirectUri !== redirectUri) {
      throw { code: "invalid_grant", description: "Redirect URI mismatch" };
    }

    // PKCE Validation (Must be S256)
    const isPkceValid = verifyPkce(
      codeVerifier,
      authCodeDoc.codeChallenge,
      authCodeDoc.codeChallengeMethod
    );
    if (!isPkceValid) {
      throw { code: "invalid_grant", description: "Invalid PKCE code_verifier" };
    }

    // Mark code as used immediately to prevent reuse
    await this.authCodeRepo.markAsUsed(authCodeDoc._id.toString());

    const user = await this.userRepo.findById(authCodeDoc.userId.toString());
    if (!user) {
      throw { code: "invalid_grant", description: "User associated with code not found" };
    }

    // Generate Tokens
    return this.issueTokenSet(user, clientId, authCodeDoc.scope, authCodeDoc.nonce);
  }

  /**
   * Rotates a Refresh Token with Replay Attack Family Revocation Detection
   */
  async rotateRefreshToken(rawRefreshToken: string, clientId: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const refreshTokenDoc = await this.tokenRepo.findRefreshTokenByHash(tokenHash);

    if (!refreshTokenDoc) {
      throw { code: "invalid_grant", description: "Refresh token not found or expired" };
    }

    if (refreshTokenDoc.clientId !== clientId) {
      throw { code: "invalid_grant", description: "Client ID mismatch" };
    }

    // REPLAY ATTACK DETECTION!
    if (refreshTokenDoc.revoked) {
      // Revoke ENTIRE token family
      await this.tokenRepo.revokeFamily(refreshTokenDoc.familyId);
      throw {
        code: "invalid_grant",
        description: "Refresh token has been reused! Revoking token family for security.",
      };
    }

    if (new Date() > refreshTokenDoc.expiresAt) {
      throw { code: "invalid_grant", description: "Refresh token expired" };
    }

    const user = await this.userRepo.findById(refreshTokenDoc.userId.toString());
    if (!user) {
      throw { code: "invalid_grant", description: "User not found" };
    }

    // Mark current refresh token as revoked and replaced
    const newRawRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRawRefreshToken);
    await this.tokenRepo.revokeRefreshToken(refreshTokenDoc._id.toString(), newRefreshTokenHash);

    // Create new Refresh Token in same family
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + jwtConfig.refreshTokenExpiryDays);

    await this.tokenRepo.createRefreshToken({
      tokenHash: newRefreshTokenHash,
      familyId: refreshTokenDoc.familyId,
      clientId,
      userId: user._id as any,
      scope: refreshTokenDoc.scope,
      expiresAt: refreshExpiresAt,
      revoked: false,
    });

    // Create Access Token & ID Token
    const accessTokenObj = await this.generateAccessToken(user, clientId, refreshTokenDoc.scope);
    let idToken: string | undefined = undefined;
    if (refreshTokenDoc.scope.includes("openid")) {
      idToken = await this.oidcService.generateIdToken(user, clientId, undefined, refreshTokenDoc.scope);
    }

    return {
      access_token: accessTokenObj.jwt,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: newRawRefreshToken,
      id_token: idToken,
      scope: refreshTokenDoc.scope,
    };
  }

  /**
   * Issues Access Token, Refresh Token (new family), and OIDC ID Token
   */
  private async issueTokenSet(
    user: any,
    clientId: string,
    scope: string,
    nonce?: string
  ) {
    const familyId = generateFamilyId();
    const rawRefreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(rawRefreshToken);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + jwtConfig.refreshTokenExpiryDays);

    await this.tokenRepo.createRefreshToken({
      tokenHash: refreshTokenHash,
      familyId,
      clientId,
      userId: user._id,
      scope,
      expiresAt: refreshExpiresAt,
      revoked: false,
    });

    const accessTokenObj = await this.generateAccessToken(user, clientId, scope);

    let idToken: string | undefined = undefined;
    if (scope.includes("openid")) {
      idToken = await this.oidcService.generateIdToken(user, clientId, nonce, scope);
    }

    return {
      access_token: accessTokenObj.jwt,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: rawRefreshToken,
      id_token: idToken,
      scope,
    };
  }

  /**
   * Generates a signed Access Token JWT (RS256)
   */
  private async generateAccessToken(user: any, clientId: string, scope: string) {
    const jti = "jti_" + generateAuthCode();
    const privateKey = getPrivateKey();

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 3600;

    const jwt = await new jose.SignJWT({
      client_id: clientId,
      scope,
    })
      .setProtectedHeader({ alg: "RS256", kid: jwtConfig.kid, typ: "at+jwt" })
      .setIssuer(jwtConfig.issuer)
      .setSubject(user._id.toString())
      .setAudience(clientId)
      .setJti(jti)
      .setIssuedAt(now)
      .setExpirationTime(expiresAt)
      .sign(privateKey);

    // Track JTI in AccessToken repo for revocation checks
    await this.tokenRepo.createAccessToken({
      jti,
      clientId,
      userId: user._id,
      scope,
      expiresAt: new Date(expiresAt * 1000),
      revoked: false,
    });

    return { jwt, jti };
  }

  /**
   * Verifies an Access Token JWT and checks JTI revocation status
   */
  async verifyAccessToken(token: string) {
    const publicKey = getPublicKey();
    const { payload } = await jose.jwtVerify(token, publicKey, {
      issuer: jwtConfig.issuer,
    });

    const jti = payload.jti;
    if (jti) {
      const dbToken = await this.tokenRepo.findAccessTokenByJti(jti);
      if (dbToken && dbToken.revoked) {
        throw new Error("TOKEN_REVOKED");
      }
    }

    return payload;
  }

  /**
   * Revokes an Access Token or Refresh Token (RFC 7009)
   */
  async revokeToken(token: string) {
    const tokenHash = hashToken(token);
    // Check if it's a refresh token
    const rt = await this.tokenRepo.findRefreshTokenByHash(tokenHash);
    if (rt) {
      await this.tokenRepo.revokeRefreshToken(rt._id.toString());
      return true;
    }
    // Check if it's a JWT access token
    try {
      const publicKey = getPublicKey();
      const { payload } = await jose.jwtVerify(token, publicKey, { issuer: jwtConfig.issuer });
      if (payload.jti) {
        await this.tokenRepo.revokeAccessToken(payload.jti);
        return true;
      }
    } catch {
      // Ignore JWT verify errors during revocation
    }
    return true;
  }

  /**
   * Introspects a token (RFC 7662)
   */
  async introspectToken(token: string) {
    try {
      const publicKey = getPublicKey();
      const { payload } = await jose.jwtVerify(token, publicKey, { issuer: jwtConfig.issuer });
      const jti = payload.jti;
      if (jti) {
        const dbToken = await this.tokenRepo.findAccessTokenByJti(jti);
        if (dbToken && dbToken.revoked) {
          return { active: false };
        }
      }
      return {
        active: true,
        scope: payload.scope,
        client_id: payload.client_id,
        sub: payload.sub,
        exp: payload.exp,
        iat: payload.iat,
        token_type: "Bearer",
      };
    } catch {
      // Check if it's a valid refresh token
      const tokenHash = hashToken(token);
      const rt = await this.tokenRepo.findRefreshTokenByHash(tokenHash);
      if (rt && !rt.revoked && new Date() < rt.expiresAt) {
        return {
          active: true,
          scope: rt.scope,
          client_id: rt.clientId,
          sub: rt.userId.toString(),
          exp: Math.floor(rt.expiresAt.getTime() / 1000),
          token_type: "Refresh",
        };
      }
      return { active: false };
    }
  }
}
