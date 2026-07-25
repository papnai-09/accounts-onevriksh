import mongoose, { Schema, Document } from "mongoose";

export interface ILoginHistory extends Document {
  userId: mongoose.Types.ObjectId;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  browser?: string;
  os?: string;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  createdAt: Date;
}

const LoginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED", "BLOCKED"], required: true },
    browser: String,
    os: String,
    device: String,
    ipAddress: String,
    userAgent: String,
    failureReason: String,
  },
  { timestamps: true, collection: "login_history" }
);

LoginHistorySchema.index({ userId: 1, createdAt: -1 });

export const LoginHistory =
  mongoose.models.LoginHistory || mongoose.model<ILoginHistory>("LoginHistory", LoginHistorySchema);
