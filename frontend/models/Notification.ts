import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "SECURITY" | "ACCOUNT" | "SYSTEM" | "LOGIN_ALERT";
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["SECURITY", "ACCOUNT", "SYSTEM", "LOGIN_ALERT"],
      default: "SYSTEM",
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    actionUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
