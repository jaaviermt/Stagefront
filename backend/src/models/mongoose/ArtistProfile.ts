import mongoose, { Document, Schema } from "mongoose";

export interface IArtistProfile extends Document {
  name: string;
  bio: string;
  genres: string[];
  social_links: Record<string, string>;
  media: string[];
}

const ArtistProfileSchema = new Schema<IArtistProfile>(
  {
    name: { type: String, required: true },
    bio: { type: String, required: true },
    genres: [{ type: String }],
    social_links: { type: Map, of: String, default: {} },
    media: [{ type: String }],
  },
  { timestamps: true }
);

ArtistProfileSchema.index({ name: "text" });

export const ArtistProfile = mongoose.model<IArtistProfile>("ArtistProfile", ArtistProfileSchema);
