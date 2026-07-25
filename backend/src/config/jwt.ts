import { env } from "./env.js";

export const jwtConfig = {
  issuer: env.ISSUER,
  accessTokenExpiry: "1h",      // Access token lifespan: 1 hour
  refreshTokenExpiryDays: 30,  // Refresh token lifespan: 30 days
  authCodeExpirySeconds: 300,  // Authorization code lifespan: 5 minutes
  sessionExpiryDays: 30,       // Session cookie lifespan: 30 days
  kid: env.KID,
};
