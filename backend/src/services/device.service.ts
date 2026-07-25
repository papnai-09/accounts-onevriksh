import { DeviceRepository } from "../repositories/device.repository.js";
import { parseUserAgent } from "../utils/uaParser.util.js";

export class DeviceService {
  private deviceRepo = new DeviceRepository();

  async registerOrUpdateDevice(userId: string, fingerprint: string, ipAddress: string, userAgent?: string) {
    const { browser, os, deviceName } = parseUserAgent(userAgent);
    return this.deviceRepo.addOrUpdateDevice({
      userId: userId as any,
      deviceFingerprint: fingerprint,
      deviceName: `${browser} on ${os}`,
      browser,
      os,
      ipAddress,
      lastUsedAt: new Date(),
    });
  }

  async getUserDevices(userId: string) {
    return this.deviceRepo.findUserDevices(userId);
  }

  async revokeDevice(userId: string, deviceId: string) {
    return this.deviceRepo.removeDevice(userId, deviceId);
  }
}
