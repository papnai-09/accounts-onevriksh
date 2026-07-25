import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserPreference extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  theme: "light" | "dark" | "system";
  emailNotifications: {
    securityAlerts: boolean;
    loginAlerts: boolean;
    marketingEmails: boolean;
    newsletter: boolean;
  };
  twoFactorEnabled: boolean;
  twoFactorMethod?: "AUTHENTICATOR_APP" | "SMS" | "EMAIL";
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferenceSchema: Schema<IUserPreference> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    emailNotifications: {
      securityAlerts: { type: Boolean, default: true },
      loginAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ["AUTHENTICATOR_APP", "SMS", "EMAIL"] },
  },
  { timestamps: true }
);

export const UserPreference: Model<IUserPreference> =
  mongoose.models.UserPreference || mongoose.model<IUserPreference>("UserPreference", UserPreferenceSchema);
