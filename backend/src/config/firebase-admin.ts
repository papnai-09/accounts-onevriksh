import { decodeJwt } from "jose";

export async function verifyFirebaseIdToken(idToken: string) {
  try {
    if (!idToken) return null;
    const decodedToken = decodeJwt(idToken);
    return decodedToken;
  } catch (error) {
    console.error("[Firebase Verification] Token decode error:", error);
    return null;
  }
}

export default { verifyFirebaseIdToken };
