import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user_id: { type: String, required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ActivityLogSchema.index({ user_id: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
