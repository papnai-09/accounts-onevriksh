import mongoose, { Document, Schema } from "mongoose";

export interface IOAuthClient extends Document {
  clientId: string;
  clientSecretHash?: string;
  clientName: string;
  logoUrl?: string;
  redirectUris: string[];
  allowedOrigins: string[];
  scopes: string[];
  grantTypes: string[];
  responseTypes: string[];
  isPkceRequired: boolean;
  isFirstParty: boolean;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  createdAt: Date;
  updatedAt: Date;
}

const OAuthClientSchema = new Schema<IOAuthClient>(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    clientSecretHash: { type: String, select: false },
    clientName: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    redirectUris: { type: [String], required: true },
    allowedOrigins: { type: [String], default: [] },
    scopes: { type: [String], default: ["openid", "profile", "email", "offline_access"] },
    grantTypes: { type: [String], default: ["authorization_code", "refresh_token"] },
    responseTypes: { type: [String], default: ["code"] },
    isPkceRequired: { type: Boolean, default: true },
    isFirstParty: { type: Boolean, default: false },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED", "REVOKED"], default: "ACTIVE" },
  },
  {
    timestamps: true,
    collection: "oauth_clients",
  }
);

if (mongoose.models && (mongoose.models as any).OAuthClient) {
  delete (mongoose.models as any).OAuthClient;
}

export const OAuthClient = mongoose.model<IOAuthClient>("OAuthClient", OAuthClientSchema);
