export interface ParsedUserAgent {
  browser: string;
  os: string;
  deviceName: string;
}

export function parseUserAgent(userAgentString?: string): ParsedUserAgent {
  if (!userAgentString) {
    return { browser: "Unknown Browser", os: "Unknown OS", deviceName: "Unknown Device" };
  }

  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceName = "Desktop";

  // Browser detection
  if (/chrome|crios/i.test(userAgentString) && !/edg/i.test(userAgentString) && !/opr/i.test(userAgentString)) {
    browser = "Chrome";
  } else if (/safari/i.test(userAgentString) && !/chrome/i.test(userAgentString)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(userAgentString)) {
    browser = "Firefox";
  } else if (/edg/i.test(userAgentString)) {
    browser = "Edge";
  } else if (/opr|opera/i.test(userAgentString)) {
    browser = "Opera";
  }

  // OS detection
  if (/windows/i.test(userAgentString)) {
    os = "Windows";
  } else if (/mac os|macintosh/i.test(userAgentString)) {
    os = "macOS";
  } else if (/android/i.test(userAgentString)) {
    os = "Android";
    deviceName = "Mobile Device";
  } else if (/iphone|ipad|ipod/i.test(userAgentString)) {
    os = "iOS";
    deviceName = /ipad/i.test(userAgentString) ? "iPad" : "iPhone";
  } else if (/linux/i.test(userAgentString)) {
    os = "Linux";
  }

  return { browser, os, deviceName };
}
