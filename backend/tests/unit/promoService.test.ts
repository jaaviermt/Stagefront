import { describe, it, expect } from "vitest";
import { applyPromoCode } from "../../src/services/promoService.js";
import type { PromoCode } from "../../src/types/index.js";

const VALID_CODES: PromoCode[] = [
  { code: "STAGEFRONT10", discount: 10, type: "percentage" },
  { code: "FIRSTORDER", discount: 15, type: "fixed", min_purchase: 50 },
  { code: "HALFOFF", discount: 50, type: "percentage" },
];

describe("promoService.applyPromoCode", () => {
  it("applies a percentage discount correctly", () => {
    // 1000 - 10% = 900
    expect(applyPromoCode(1000, "STAGEFRONT10", VALID_CODES)).toBe(900);
  });

  it("applies a fixed discount correctly", () => {
    expect(applyPromoCode(200, "FIRSTORDER", VALID_CODES)).toBe(185);
  });

  it("is case-insensitive and trims the code", () => {
    expect(applyPromoCode(1000, "  stagefront10  ", VALID_CODES)).toBe(900);
  });

  it("returns the original total for an unknown code", () => {
    expect(applyPromoCode(1000, "NOPE", VALID_CODES)).toBe(1000);
  });

  it("ignores a fixed code when the minimum purchase is not met", () => {
    // FIRSTORDER requires min_purchase 50; total 40 is below
    expect(applyPromoCode(40, "FIRSTORDER", VALID_CODES)).toBe(40);
  });

  it("never returns a negative total (clamps a large fixed discount to 0)", () => {
    const codes: PromoCode[] = [{ code: "BIG", discount: 9999, type: "fixed" }];
    expect(applyPromoCode(10, "BIG", codes)).toBe(0);
  });

  it("returns the total unchanged when total is zero or negative", () => {
    expect(applyPromoCode(0, "STAGEFRONT10", VALID_CODES)).toBe(0);
    expect(applyPromoCode(-100, "STAGEFRONT10", VALID_CODES)).toBe(-100);
  });

  it("returns the total unchanged when no code is provided", () => {
    expect(applyPromoCode(500, "", VALID_CODES)).toBe(500);
  });

  it("returns the total unchanged when the valid-codes list is empty", () => {
    expect(applyPromoCode(500, "STAGEFRONT10", [])).toBe(500);
  });
});
