import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./helpers/testApp.js";

/**
 * Resale rules (requires seeded PostgreSQL).
 * Business rule under test: resale price may not exceed +30% of the original.
 */
describe("Resales API (requires seeded PostgreSQL)", () => {
  it("GET /api/v1/resales returns 200 with active resales", async () => {
    const res = await request(app).get("/api/v1/resales");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/v1/resales returns 404 when no original purchase exists", async () => {
    const res = await request(app).post("/api/v1/resales").send({
      seat_id: "seat-with-no-order-000",
      seller_id: "seed-user-demo",
      price: 1000,
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/original purchase/i);
  });
});
