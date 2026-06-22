import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./helpers/testApp.js";

// These two checks do NOT touch any database and always run.
describe("Infrastructure routes (no DB required)", () => {
  it("GET /health returns 200 and status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET unknown route returns 404 with a typed error body", async () => {
    const res = await request(app).get("/this/does/not/exist");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/v1/orders with empty body returns 400 (no seats selected)", async () => {
    const res = await request(app).post("/api/v1/orders").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no seats/i);
  });
});
