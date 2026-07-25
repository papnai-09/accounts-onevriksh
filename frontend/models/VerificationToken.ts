import mongoose, { Schema, Document } from "mongoose";

export interface IVerificationToken extends Document {
  userId?: mongoose.Types.ObjectId;
  identifier?: string;
  token: string;
  type?: string;
  payload?: any;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null },
    identifier: { type: String, index: true },
    token: { type: String, required: true, unique: true },
    type: { type: String, default: "PHONE_OTP" },
    payload: { type: Schema.Types.Mixed, required: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "verification_tokens" }
);

VerificationTokenSchema.index({ token: 1 });
VerificationTokenSchema.index({ userId: 1 });
VerificationTokenSchema.index({ identifier: 1 });
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Purge any cached Mongoose model instances on both global models and active connections
if (mongoose.models && (mongoose.models as any).VerificationToken) {
  delete (mongoose.models as any).VerificationToken;
}
if (mongoose.connection && mongoose.connection.models && (mongoose.connection.models as any).VerificationToken) {
  delete (mongoose.connection.models as any).VerificationToken;
}

export default mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);
