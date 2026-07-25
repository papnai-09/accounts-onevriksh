import mongoose, { Document, Schema } from "mongoose";

export interface ITrustedDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceFingerprint: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastUsedAt: Date;
  trustedAt: Date;
}

const TrustedDeviceSchema = new Schema<ITrustedDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deviceFingerprint: { type: String, required: true, index: true },
    deviceName: { type: String, required: true },
    browser: { type: String, default: "Unknown Browser" },
    os: { type: String, default: "Unknown OS" },
    ipAddress: { type: String, required: true },
    lastUsedAt: { type: Date, default: Date.now },
    trustedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "trusted_devices",
  }
);

TrustedDeviceSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });

if (mongoose.models && (mongoose.models as any).TrustedDevice) {
  delete (mongoose.models as any).TrustedDevice;
}

export const TrustedDevice = mongoose.model<ITrustedDevice>("TrustedDevice", TrustedDeviceSchema);
