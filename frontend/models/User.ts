import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  language?: string;
  timezone?: string;
  website?: string;
  occupation?: string;
  company?: string;
  socialLinks?: Record<string, string>;
  roles: string[];
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING" | "PENDING_VERIFICATION" | "INACTIVE" | "DELETED" | "BLOCKED";
  isBlocked?: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  is2FAEnabled: boolean;
  totpSecret?: string;
  newsletterSubscribed: boolean;
  failedLoginAttempts: number;
  lastFailedLogin?: Date;
  lastLogin?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: String,
    coverUrl: String,
    bio: { type: String, maxlength: 500 },
    country: String,
    state: String,
    city: String,
    address: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], default: "PREFER_NOT_TO_SAY" },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    website: String,
    occupation: String,
    company: String,
    socialLinks: { type: Map, of: String, default: {} },
    roles: { type: [String], default: ["USER"] },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED", "BANNED", "PENDING", "PENDING_VERIFICATION", "INACTIVE", "DELETED", "BLOCKED"], default: "PENDING_VERIFICATION" },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    is2FAEnabled: { type: Boolean, default: false },
    totpSecret: { type: String, select: false },
    newsletterSubscribed: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLogin: Date,
    lastLogin: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: "users",
  }
);

UserSchema.index({ status: 1 });
UserSchema.index({ isDeleted: 1 });

if (mongoose.models && (mongoose.models as any).User) {
  delete (mongoose.models as any).User;
}

export default mongoose.model<IUser>("User", UserSchema);
