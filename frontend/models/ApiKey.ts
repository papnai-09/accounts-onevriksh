import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  keyHash: string;
  prefix: string;
  scopes: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  isRevoked: boolean;
  createdAt: Date;
}

const ApiKeySchema: Schema<IApiKey> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    scopes: [{ type: String }],
    expiresAt: { type: Date },
    lastUsedAt: { type: Date },
    isRevoked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
export default ApiKey;
