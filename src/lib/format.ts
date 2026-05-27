export function fmtMoney(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return "$" + Math.round(v).toLocaleString("es-AR");
}

export function margen(costo: number, venta: number): number | null {
  if (!costo || !venta || venta <= 0) return null;
  return ((venta - costo) / venta) * 100;
}

export function markup(costo: number, venta: number): number | null {
  if (!costo || !venta || costo <= 0) return null;
  return ((venta - costo) / costo) * 100;
}

export function precioSugerido(costo: number, margenPct: number): number | null {
  if (!costo) return null;
  return Math.round(costo / (1 - margenPct / 100));
}
