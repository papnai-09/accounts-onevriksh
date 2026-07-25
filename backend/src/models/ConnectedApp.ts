import mongoose, { Document, Schema } from "mongoose";

export interface IConnectedApp extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: string;
  grantedScopes: string[];
  grantedAt: Date;
  updatedAt: Date;
}

const ConnectedAppSchema = new Schema<IConnectedApp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientId: { type: String, required: true, index: true },
    grantedScopes: { type: [String], required: true },
    grantedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "connected_apps",
  }
);

ConnectedAppSchema.index({ userId: 1, clientId: 1 }, { unique: true });

if (mongoose.models && (mongoose.models as any).ConnectedApp) {
  delete (mongoose.models as any).ConnectedApp;
}

export const ConnectedApp = mongoose.model<IConnectedApp>("ConnectedApp", ConnectedAppSchema);
