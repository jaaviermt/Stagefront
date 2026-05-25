import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user_id: string;
  event_id: string;
  rating: number;
  comment: string;
  created_at: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user_id: { type: String, required: true },
    event_id: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ReviewSchema.index({ event_id: 1 });
ReviewSchema.index({ user_id: 1, event_id: 1 }, { unique: true });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
