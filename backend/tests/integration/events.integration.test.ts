import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./helpers/testApp.js";

/**
 * Requires a seeded PostgreSQL. Validates schema shape, status codes, filters
 * and the public stats endpoint.
 */
describe("Events API (requires seeded PostgreSQL)", () => {
  it("GET /api/v1/events returns 200 with an array of events", async () => {
    const res = await request(app).get("/api/v1/events");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/events?city=CDMX filters by venue city", async () => {
    const res = await request(app).get("/api/v1/events").query({ city: "CDMX" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/events/:id returns 404 for an unknown event", async () => {
    const res = await request(app).get("/api/v1/events/nonexistent-id-000");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("GET /api/v1/events/:id returns 200 with zones + venue for a real event", async () => {
    const list = await request(app).get("/api/v1/events");
    const first = list.body.data?.[0];
    expect(first, "seed data required").toBeDefined();

    const res = await request(app).get(`/api/v1/events/${first.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("venue");
    expect(res.body.data).toHaveProperty("zones");
    expect(res.body.data).toHaveProperty("soldOut");
  });

  it("GET /api/v1/stats returns the public stats schema", async () => {
    const res = await request(app).get("/api/v1/stats");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("activeEvents");
    expect(res.body.data).toHaveProperty("ticketsSold");
    expect(res.body.data).toHaveProperty("currency");
  });
});
