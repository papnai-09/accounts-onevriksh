import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionTokenHash: string;
  ipAddress: string;
  userAgent?: string;
  browser: string;
  os: string;
  deviceName: string;
  country: string;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionTokenHash: { type: String, required: true, unique: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    browser: { type: String, default: "Unknown Browser" },
    os: { type: String, default: "Unknown OS" },
    deviceName: { type: String, default: "Desktop" },
    country: { type: String, default: "India" },
    lastActivity: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: "sessions",
  }
);

if (mongoose.models && (mongoose.models as any).Session) {
  delete (mongoose.models as any).Session;
}

export const Session = mongoose.model<ISession>("Session", SessionSchema);
