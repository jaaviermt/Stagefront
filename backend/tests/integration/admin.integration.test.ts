import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./helpers/testApp.js";

/**
 * Admin CRUD lifecycle (requires seeded PostgreSQL).
 * Covers POST (201) -> PATCH (200) -> DELETE (204) plus validation/not-found.
 *
 * SECURITY NOTE: these endpoints are currently UNAUTHENTICATED in the app
 * (see docs/quality/SECURITY_REPORT.md, finding A01). The tests document the
 * current behaviour; once auth is added, expect 401/403 cases to be appended.
 */
describe("Admin API (requires seeded PostgreSQL)", () => {
  it("GET /api/v1/admin/stats returns aggregated metrics", async () => {
    const res = await request(app).get("/api/v1/admin/stats");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("revenue");
    expect(res.body.data).toHaveProperty("totalOrders");
  });

  it("GET /api/v1/admin/orders?limit=5 respects the limit param", async () => {
    const res = await request(app).get("/api/v1/admin/orders").query({ limit: 5 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it("full event lifecycle: create (201) -> update (200) -> delete (204)", async () => {
    const venues = await request(app).get("/api/v1/admin/venues");
    const venueId = venues.body.data?.[0]?.id;
    expect(venueId, "seed data required").toBeDefined();

    const created = await request(app)
      .post("/api/v1/admin/events")
      .send({
        title: "QA Integration Event",
        artist_name: "Test Artist",
        venue_id: venueId,
        date: "2026-12-31T20:00:00.000Z",
        total_capacity: 100,
        genre: "test",
        description: "created by integration suite",
        status: "draft",
      });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;

    const updated = await request(app)
      .patch(`/api/v1/admin/events/${id}`)
      .send({ status: "published" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("published");

    const deleted = await request(app).delete(`/api/v1/admin/events/${id}`);
    expect([200, 204]).toContain(deleted.status);
  });

  it("PATCH /api/v1/admin/events/:id with unknown id is rejected", async () => {
    const res = await request(app)
      .patch("/api/v1/admin/events/nonexistent-000")
      .send({ status: "published" });
    // CURRENT behaviour is 500 (Prisma throws on missing record); the API
    // SHOULD return 404. Tracked as DEF-004 in docs/quality/BUG_REPORTS.md.
    expect([404, 500]).toContain(res.status);
  });
});
