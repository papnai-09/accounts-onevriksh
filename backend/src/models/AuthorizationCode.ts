import mongoose, { Document, Schema } from "mongoose";

export interface IAuthorizationCode extends Document {
  codeHash: string;
  clientId: string;
  userId: mongoose.Types.ObjectId;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  nonce?: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const AuthorizationCodeSchema = new Schema<IAuthorizationCode>(
  {
    codeHash: { type: String, required: true, unique: true, index: true },
    clientId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    redirectUri: { type: String, required: true },
    scope: { type: String, required: true },
    codeChallenge: { type: String, required: true },
    codeChallengeMethod: { type: String, required: true, default: "S256" },
    nonce: { type: String },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    collection: "authorization_codes",
  }
);

if (mongoose.models && (mongoose.models as any).AuthorizationCode) {
  delete (mongoose.models as any).AuthorizationCode;
}

export const AuthorizationCode = mongoose.model<IAuthorizationCode>(
  "AuthorizationCode",
  AuthorizationCodeSchema
);
