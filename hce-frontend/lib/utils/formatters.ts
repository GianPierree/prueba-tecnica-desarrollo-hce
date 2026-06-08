export const TAX_RATE = 0.18;
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(amount);
}
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
export function calculateTotals(subtotal: number): { igv: number; total: number } {
  const igv = subtotal * TAX_RATE;
  return { igv, total: subtotal + igv };
}
