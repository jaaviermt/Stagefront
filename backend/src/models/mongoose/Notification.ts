import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

NotificationSchema.index({ user_id: 1, read: 1 });

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
