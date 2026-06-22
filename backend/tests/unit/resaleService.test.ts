import { describe, it, expect } from "vitest";
import { validateResalePrice } from "../../src/services/resaleService.js";

describe("resaleService.validateResalePrice", () => {
  it("accepts a resale at the exact original price", () => {
    expect(validateResalePrice(1000, 1000)).toBe(true);
  });

  it("accepts a resale at exactly the 30% markup boundary", () => {
    // 1000 * 1.30 = 1300 is the maximum allowed
    expect(validateResalePrice(1000, 1300)).toBe(true);
  });

  it("rejects a resale just above the 30% markup boundary", () => {
    expect(validateResalePrice(1000, 1300.01)).toBe(false);
  });

  it("rejects a resale far above the 30% markup", () => {
    expect(validateResalePrice(1000, 2000)).toBe(false);
  });

  it("allows reselling below the original price", () => {
    expect(validateResalePrice(1000, 750)).toBe(true);
  });

  it("rejects non-positive original prices", () => {
    expect(validateResalePrice(0, 100)).toBe(false);
    expect(validateResalePrice(-50, 100)).toBe(false);
  });

  it("rejects non-positive resale prices", () => {
    expect(validateResalePrice(1000, 0)).toBe(false);
    expect(validateResalePrice(1000, -10)).toBe(false);
  });
});
