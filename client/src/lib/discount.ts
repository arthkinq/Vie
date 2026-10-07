export function calculateDiscount(price: number, type: string): number {
  if (type === "vip") return price * 0.8;
  if (type === "student") return price * 0.5;
  if (type === "senior") return price * 0.7;
  if (price > 1000) return price - 100;
  return price;
}
