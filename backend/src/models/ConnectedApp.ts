import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConnectedApp extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  domain: string;
  clientId: string;
  clientSecretHash: string;
  redirectUris: string[];
  logoUrl?: string;
  isOfficial: boolean;
  createdAt: Date;
}

const ConnectedAppSchema: Schema<IConnectedApp> = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    clientId: { type: String, required: true, unique: true },
    clientSecretHash: { type: String, required: true },
    redirectUris: [{ type: String, required: true }],
    logoUrl: { type: String, default: "" },
    isOfficial: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ConnectedApp: Model<IConnectedApp> =
  mongoose.models.ConnectedApp || mongoose.model<IConnectedApp>("ConnectedApp", ConnectedAppSchema);
