import type { User, Event, PurchaseValidation } from "../types/index.js";

const MAX_TICKETS_PER_ORDER = 10;

export function canUserPurchase(
  user: User | null | undefined,
  event: Event | null | undefined,
  quantity: number
): PurchaseValidation {
  if (!user) return { allowed: false, reason: "User not found" };
  if (!event) return { allowed: false, reason: "Event not found" };
  if (event.status !== "published") {
    return { allowed: false, reason: "Event is not available for purchase" };
  }
  if (quantity <= 0) {
    return { allowed: false, reason: "Quantity must be at least 1" };
  }
  if (quantity > MAX_TICKETS_PER_ORDER) {
    return {
      allowed: false,
      reason: `Cannot purchase more than ${MAX_TICKETS_PER_ORDER} tickets per order`,
    };
  }
  return { allowed: true };
}
