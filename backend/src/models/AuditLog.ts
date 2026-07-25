import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  clientId?: string;
  eventType: string;
  status: "SUCCESS" | "FAILURE";
  ipAddress: string;
  userAgent?: string;
  country?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    clientId: { type: String, index: true },
    eventType: { type: String, required: true, index: true },
    status: { type: String, enum: ["SUCCESS", "FAILURE"], required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    country: { type: String, default: "India" },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: "audit_logs",
  }
);

if (mongoose.models && (mongoose.models as any).AuditLog) {
  delete (mongoose.models as any).AuditLog;
}

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
