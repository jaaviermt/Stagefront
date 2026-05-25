import type { OrderItem } from "../types/index.js";

export function calculateOrderTotal(items: OrderItem[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.price, 0);
}
