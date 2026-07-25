import * as jose from "jose";
import { env } from "./env.js";

let privateKey: jose.KeyLike | Uint8Array;
let publicKey: jose.KeyLike | Uint8Array;
let publicJwk: jose.JWK;

export async function initJwks() {
  if (env.RSA_PRIVATE_KEY && env.RSA_PUBLIC_KEY) {
    privateKey = await jose.importPKCS8(env.RSA_PRIVATE_KEY, "RS256");
    publicKey = await jose.importSPKI(env.RSA_PUBLIC_KEY, "RS256");
  } else {
    // Generate RSA 2048-bit keypair dynamically for OIDC RS256 signing
    const keyPair = await jose.generateKeyPair("RS256", { extractable: true });
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;
  }

  const rawJwk = await jose.exportJWK(publicKey);
  publicJwk = {
    ...rawJwk,
    kty: "RSA",
    alg: "RS256",
    use: "sig",
    kid: env.KID,
  };

  console.log("🔐 [JWKS Manager] RSA keypair initialized for OIDC RS256 signing (KID: " + env.KID + ")");
}

export function getPrivateKey() {
  if (!privateKey) {
    throw new Error("JWKS keypair not initialized. Call initJwks() first.");
  }
  return privateKey;
}

export function getPublicKey() {
  if (!publicKey) {
    throw new Error("JWKS keypair not initialized. Call initJwks() first.");
  }
  return publicKey;
}

export function getJwks() {
  if (!publicJwk) {
    throw new Error("JWKS keypair not initialized. Call initJwks() first.");
  }
  return {
    keys: [publicJwk],
  };
}
