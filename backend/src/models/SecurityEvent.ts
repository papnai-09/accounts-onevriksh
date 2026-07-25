import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISecurityEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventType: "PASSWORD_CHANGE" | "EMAIL_CHANGE" | "PHONE_CHANGE" | "SESSION_REVOKED" | "ACCOUNT_DEACTIVATED" | "DATA_EXPORT";
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  createdAt: Date;
}

const SecurityEventSchema: Schema<ISecurityEvent> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ["PASSWORD_CHANGE", "EMAIL_CHANGE", "PHONE_CHANGE", "SESSION_REVOKED", "ACCOUNT_DEACTIVATED", "DATA_EXPORT"],
      index: true,
    },
    description: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "Unknown" },
    severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL"], default: "INFO" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SecurityEventSchema.index({ userId: 1, createdAt: -1 });

export const SecurityEvent: Model<ISecurityEvent> =
  mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>("SecurityEvent", SecurityEventSchema);
