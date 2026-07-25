import crypto from "node:crypto";

/**
 * Validates a PKCE code_verifier against a code_challenge using S256.
 * S256: BASE64URL-ENCODE(SHA256(ASCII(code_verifier))) == code_challenge
 */
export function verifyPkce(codeVerifier: string, codeChallenge: string, method: string = "S256"): boolean {
  if (method !== "S256") {
    return false; // OAuth 2.1 mandates S256
  }

  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const calculatedChallenge = hash
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return crypto.timingSafeEqual(Buffer.from(calculatedChallenge), Buffer.from(codeChallenge));
}

/**
 * Generates a random code_verifier for testing or client utilities
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generates an S256 code challenge from a verifier
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}
