import * as jose from "jose";
import { getPrivateKey } from "../config/jwks.js";
import { jwtConfig } from "../config/jwt.js";
import { IUser } from "../models/User.js";

export class OidcService {
  async generateIdToken(
    user: IUser,
    clientId: string,
    nonce?: string,
    scope: string = "openid profile email"
  ): Promise<string> {
    const scopes = scope.split(" ");
    const privateKey = getPrivateKey();

    const now = Math.floor(Date.now() / 1000);
    const payload: Record<string, any> = {
      auth_time: now,
    };

    if (nonce) {
      payload.nonce = nonce;
    }

    if (scopes.includes("email")) {
      payload.email = user.email;
      payload.email_verified = user.isEmailVerified;
    }

    if (scopes.includes("profile")) {
      payload.name = `${user.firstName} ${user.lastName}`;
      payload.given_name = user.firstName;
      payload.family_name = user.lastName;
      if (user.avatarUrl) payload.picture = user.avatarUrl;
      if (user.username) payload.preferred_username = user.username;
    }

    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "RS256", kid: jwtConfig.kid, typ: "JWT" })
      .setIssuer(jwtConfig.issuer)
      .setSubject(user._id.toString())
      .setAudience(clientId)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);
  }

  getUserInfoClaims(user: IUser, scope: string) {
    const scopes = scope.split(" ");
    const claims: Record<string, any> = {
      sub: user._id.toString(),
    };

    if (scopes.includes("email")) {
      claims.email = user.email;
      claims.email_verified = user.isEmailVerified;
    }

    if (scopes.includes("profile")) {
      claims.name = `${user.firstName} ${user.lastName}`;
      claims.given_name = user.firstName;
      claims.family_name = user.lastName;
      if (user.username) claims.preferred_username = user.username;
      if (user.avatarUrl) claims.picture = user.avatarUrl;
      if (user.country) claims.country = user.country;
      claims.updated_at = Math.floor(new Date(user.updatedAt).getTime() / 1000);
    }

    return claims;
  }
}
