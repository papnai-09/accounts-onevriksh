import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  isValid: boolean;
  isCurrent: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ipAddress: { type: String, default: "unknown" },
    userAgent: { type: String, default: "" },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    device: { type: String, default: "Unknown" },
    isValid: { type: Boolean, default: true },
    isCurrent: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "sessions" }
);

SessionSchema.index({ userId: 1, isValid: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
