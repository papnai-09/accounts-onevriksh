export function getCountryFromIp(ip?: string): string {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "Local Network";
  }
  // In production, integrate with GeoIP2 or Cloudflare CF-IPCountry header
  return "India";
}
