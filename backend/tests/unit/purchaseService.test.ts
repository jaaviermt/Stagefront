import { describe, it, expect } from "vitest";
import { canUserPurchase } from "../../src/services/purchaseService.js";
import type { User, Event } from "../../src/types/index.js";

const user: User = {
  id: "u1",
  name: "Demo Buyer",
  email: "buyer@stagefront.mx",
  role: "buyer",
  created_at: new Date("2026-01-01"),
};

const publishedEvent: Event = {
  id: "e1",
  title: "Rosalía — Motomami Tour",
  artist_name: "Rosalía",
  venue_id: "v1",
  date: new Date("2026-09-01"),
  status: "published",
  total_capacity: 5000,
  genre: "pop",
  description: "",
  image_url: "",
};

describe("purchaseService.canUserPurchase", () => {
  it("allows a valid purchase within the limit", () => {
    expect(canUserPurchase(user, publishedEvent, 4)).toEqual({ allowed: true });
  });

  it("rejects when the user is missing", () => {
    const result = canUserPurchase(null, publishedEvent, 2);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/user/i);
  });

  it("rejects when the event is missing", () => {
    const result = canUserPurchase(user, null, 2);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/event/i);
  });

  it("rejects when the event is not published", () => {
    const result = canUserPurchase(user, { ...publishedEvent, status: "draft" }, 2);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/not available/i);
  });

  it("rejects a quantity of zero or less", () => {
    expect(canUserPurchase(user, publishedEvent, 0).allowed).toBe(false);
    expect(canUserPurchase(user, publishedEvent, -3).allowed).toBe(false);
  });

  it("allows exactly the maximum of 10 tickets", () => {
    expect(canUserPurchase(user, publishedEvent, 10)).toEqual({ allowed: true });
  });

  it("rejects more than 10 tickets per order", () => {
    const result = canUserPurchase(user, publishedEvent, 11);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/more than 10/i);
  });
});
