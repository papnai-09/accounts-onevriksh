import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPermission extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  module: string;
  description: string;
  createdAt: Date;
}

const PermissionSchema: Schema<IPermission> = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    module: { type: String, required: true, index: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Permission: Model<IPermission> =
  mongoose.models.Permission || mongoose.model<IPermission>("Permission", PermissionSchema);
export default Permission;
