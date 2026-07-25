import mongoose, { Document, Schema } from "mongoose";

export interface IAccessToken extends Document {
  jti: string;
  clientId: string;
  userId: mongoose.Types.ObjectId;
  scope: string;
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const AccessTokenSchema = new Schema<IAccessToken>(
  {
    jti: { type: String, required: true, unique: true, index: true },
    clientId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scope: { type: String, required: true },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    collection: "access_tokens",
  }
);

if (mongoose.models && (mongoose.models as any).AccessToken) {
  delete (mongoose.models as any).AccessToken;
}

export const AccessToken = mongoose.model<IAccessToken>("AccessToken", AccessTokenSchema);
