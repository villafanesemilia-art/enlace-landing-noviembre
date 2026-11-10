export function formatARS(value: number): string {
  return "$ " + new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
}
