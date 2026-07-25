import { TrustedDevice, ITrustedDevice } from "../models/TrustedDevice.js";

export class DeviceRepository {
  async findDevice(userId: string, fingerprint: string): Promise<ITrustedDevice | null> {
    return TrustedDevice.findOne({ userId, deviceFingerprint: fingerprint });
  }

  async addOrUpdateDevice(data: Partial<ITrustedDevice>): Promise<ITrustedDevice> {
    return TrustedDevice.findOneAndUpdate(
      { userId: data.userId, deviceFingerprint: data.deviceFingerprint },
      { ...data, lastUsedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async findUserDevices(userId: string): Promise<ITrustedDevice[]> {
    return TrustedDevice.find({ userId }).sort({ lastUsedAt: -1 });
  }

  async removeDevice(userId: string, deviceId: string): Promise<boolean> {
    const result = await TrustedDevice.deleteOne({ _id: deviceId, userId });
    return result.deletedCount > 0;
  }
}
