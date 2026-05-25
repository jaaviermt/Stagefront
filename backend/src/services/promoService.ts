import type { PromoCode } from "../types/index.js";

export function applyPromoCode(
  total: number,
  code: string,
  validCodes: PromoCode[]
): number {
  if (total <= 0 || !code || !validCodes || validCodes.length === 0) return total;

  const promo = validCodes.find(
    (p) => p.code.toLowerCase() === code.trim().toLowerCase()
  );
  if (!promo) return total;
  if (promo.min_purchase !== undefined && total < promo.min_purchase) return total;

  if (promo.type === "percentage") {
    const discount = total * (promo.discount / 100);
    return Math.max(0, total - discount);
  }

  return Math.max(0, total - promo.discount);
}
