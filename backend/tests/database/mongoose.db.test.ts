import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { connectMongo } from "../../src/lib/mongoose.js";
import { Review } from "../../src/models/mongoose/Review.js";
import { ArtistProfile } from "../../src/models/mongoose/ArtistProfile.js";

/**
 * NoSQL document/schema tests against MongoDB (Mongoose).
 * Covers: schema validation, document CRUD, collections and indexes.
 */
const TAG = `qa-${Date.now()}`;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await connectMongo();
});

afterAll(async () => {
  await Review.deleteMany({ user_id: { $regex: `^${TAG}` } });
  await ArtistProfile.deleteMany({ name: { $regex: `^${TAG}` } });
  await mongoose.disconnect();
});

describe("MongoDB / Mongoose — document & schema behaviour", () => {
  it("schema validation: rejects a rating outside the 1–5 range", async () => {
    const bad = new Review({
      user_id: `${TAG}-u`,
      event_id: `${TAG}-e`,
      rating: 9,
      comment: "too high",
    });
    await expect(bad.validate()).rejects.toThrow();
  });

  it("schema validation: requires the comment field", async () => {
    const bad = new Review({ user_id: `${TAG}-u`, event_id: `${TAG}-e`, rating: 5 });
    await expect(bad.validate()).rejects.toThrow(/comment/);
  });

  it("document CRUD: inserts and reads back a valid review", async () => {
    const doc = await Review.create({
      user_id: `${TAG}-u1`,
      event_id: `${TAG}-e1`,
      rating: 4,
      comment: "great show",
    });
    const found = await Review.findById(doc._id);
    expect(found?.rating).toBe(4);
  });

  it("unique compound index: blocks duplicate (user_id, event_id) reviews", async () => {
    const base = { user_id: `${TAG}-dup`, event_id: `${TAG}-edup`, rating: 5, comment: "ok" };
    await Review.create(base);
    await expect(Review.create(base)).rejects.toMatchObject({ code: 11000 });
  });

  it("indexes: Review collection exposes the expected indexes", async () => {
    const indexes = await Review.collection.indexes();
    const keys = indexes.map((i) => JSON.stringify(i.key));
    expect(keys).toContain(JSON.stringify({ event_id: 1 }));
    expect(keys).toContain(JSON.stringify({ user_id: 1, event_id: 1 }));
  });

  it("flexible document: stores arrays and maps on an artist profile", async () => {
    const artist = await ArtistProfile.create({
      name: `${TAG}-artist`,
      bio: "bio",
      genres: ["pop", "electronic"],
      social_links: { instagram: "https://instagram.com/x" },
      media: ["https://picsum.photos/seed/x/800/600"],
    });
    expect(artist.genres).toContain("electronic");
    expect(artist.social_links.get("instagram")).toContain("instagram.com");
  });
});
