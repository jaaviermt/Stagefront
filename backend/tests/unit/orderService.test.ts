import { describe, it, expect } from "vitest";
import { calculateOrderTotal } from "../../src/services/orderService.js";
import type { OrderItem } from "../../src/types/index.js";

describe("orderService.calculateOrderTotal", () => {
  it("returns 0 for an empty item list", () => {
    // Arrange
    const items: OrderItem[] = [];
    // Act
    const total = calculateOrderTotal(items);
    // Assert
    expect(total).toBe(0);
  });

  it("returns 0 when items is null/undefined (defensive guard)", () => {
    expect(calculateOrderTotal(undefined as unknown as OrderItem[])).toBe(0);
    expect(calculateOrderTotal(null as unknown as OrderItem[])).toBe(0);
  });

  it("sums the price of a single item", () => {
    const items: OrderItem[] = [{ seat_id: "s1", price: 1200 }];
    expect(calculateOrderTotal(items)).toBe(1200);
  });

  it("sums the prices of multiple items", () => {
    const items: OrderItem[] = [
      { seat_id: "s1", price: 1200 },
      { seat_id: "s2", price: 800 },
      { seat_id: "s3", price: 500.5 },
    ];
    expect(calculateOrderTotal(items)).toBe(2500.5);
  });

  it("handles zero-priced items without breaking the total", () => {
    const items: OrderItem[] = [
      { seat_id: "s1", price: 0 },
      { seat_id: "s2", price: 300 },
    ];
    expect(calculateOrderTotal(items)).toBe(300);
  });
});
