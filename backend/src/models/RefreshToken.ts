import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshToken extends Document {
  tokenHash: string;
  familyId: string;
  clientId: string;
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  scope: string;
  revoked: boolean;
  replacedByTokenHash?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    familyId: { type: String, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    scope: { type: String, required: true },
    revoked: { type: Boolean, default: false },
    replacedByTokenHash: { type: String },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    collection: "refresh_tokens",
  }
);

if (mongoose.models && (mongoose.models as any).RefreshToken) {
  delete (mongoose.models as any).RefreshToken;
}

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
