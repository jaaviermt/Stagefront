const MAX_MARKUP_PERCENT = 0.3;

export function validateResalePrice(originalPrice: number, resalePrice: number): boolean {
  if (originalPrice <= 0 || resalePrice <= 0) return false;
  const maxAllowed = originalPrice * (1 + MAX_MARKUP_PERCENT);
  return resalePrice <= maxAllowed;
}
