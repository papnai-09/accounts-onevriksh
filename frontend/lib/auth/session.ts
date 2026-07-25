import crypto from "crypto";

export interface ParsedUserAgent {
  browser: string;
  os: string;
  device: string;
}

export function parseUserAgent(uaString: string): ParsedUserAgent {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Desktop";

  if (!uaString) return { browser, os, device };

  // Device detection
  if (/mobile/i.test(uaString)) device = "Mobile";
  else if (/tablet|ipad/i.test(uaString)) device = "Tablet";

  // OS detection
  if (/windows/i.test(uaString)) os = "Windows";
  else if (/macintosh|mac os x/i.test(uaString)) os = "macOS";
  else if (/linux/i.test(uaString)) os = "Linux";
  else if (/android/i.test(uaString)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(uaString)) os = "iOS";

  // Browser detection
  if (/edg/i.test(uaString)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(uaString)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(uaString)) browser = "Mozilla Firefox";
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = "Apple Safari";
  else if (/opera|opr/i.test(uaString)) browser = "Opera";

  return { browser, os, device };
}

export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateFamilyId(): string {
  return `fam_${crypto.randomUUID()}`;
}
