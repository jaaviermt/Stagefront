import "dotenv/config";
import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { connectMongo } from "../../../src/lib/mongoose.js";

/**
 * Connects to MongoDB once for the whole integration run so routes that read
 * from Mongo (stats, reviews) work. If Mongo is unreachable the suite still
 * loads — DB-dependent assertions will surface the failure explicitly.
 */
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectMongo();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
