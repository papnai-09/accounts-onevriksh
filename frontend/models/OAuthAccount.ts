import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOAuthAccount extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: "google" | "github" | "microsoft";
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  idToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OAuthAccountSchema: Schema<IOAuthAccount> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, required: true, enum: ["google", "github", "microsoft"] },
    providerAccountId: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Number },
    scope: { type: String },
    idToken: { type: String },
  },
  { timestamps: true }
);

OAuthAccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const OAuthAccount: Model<IOAuthAccount> =
  mongoose.models.OAuthAccount || mongoose.model<IOAuthAccount>("OAuthAccount", OAuthAccountSchema);
export default OAuthAccount;
