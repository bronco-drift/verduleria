/**
 * Competitor prices for benchmarking against local catalog.
 * Prices in ARS for the listed unit. null = product not offered by that store.
 *
 * Match is by product name (case-insensitive). Products not in this list have
 * no competitor benchmark.
 */
export const COMPETIDORES = [
  { id: "barata", nombre: "La Barata Shop" },
  { id: "verde", nombre: "Verde Puro" },
  { id: "click", nombre: "El Click" },
  { id: "nico", nombre: "Verdulería de Nico" },
] as const;

export type CompetidorRow = {
  unit: string;
  /** [barata, verde, click, nico] — same order as COMPETIDORES */
  precios: (number | null)[];
  /** Approximate weight (grams) of one unit, for $/kg normalization. */
  pesoGramos: number | null;
};

export const PRECIOS_COMPETENCIA: Record<string, CompetidorRow> = {
  "Acelga fresca": { unit: "atado", precios: [2900, null, 3500, 1900], pesoGramos: 500 },
  "Apio": { unit: "unidad", precios: [2000, null, 1400, 3000], pesoGramos: 600 },
  "Batata": { unit: "kg", precios: [2500, null, 4500, 1850], pesoGramos: 1000 },
  "Berenjena": { unit: "kg", precios: [3900, null, null, 3000], pesoGramos: 1000 },
  "Brócoli": { unit: "unidad", precios: [null, null, null, 3000], pesoGramos: 600 },
  "Cebolla": { unit: "kg", precios: [1600, null, 2800, 2000], pesoGramos: 1000 },
  "Cebolla morada": { unit: "kg", precios: [2200, null, null, 3000], pesoGramos: 1000 },
  "Choclo": { unit: "unidad", precios: [2050, null, null, 900], pesoGramos: 300 },
  "Espinaca": { unit: "atado", precios: [1900, null, 3900, 2000], pesoGramos: 300 },
  "Lechuga manteca": { unit: "unidad", precios: [1400, 3000, null, null], pesoGramos: 300 },
  "Morrón rojo": { unit: "unidad", precios: [1300, null, null, null], pesoGramos: 200 },
  "Morrón verde": { unit: "unidad", precios: [900, null, null, null], pesoGramos: 150 },
  "Papa cepillada": { unit: "paquete", precios: [2300, null, null, 2500], pesoGramos: 2000 },
  "Perejil": { unit: "paquete", precios: [null, null, 1500, 950], pesoGramos: 80 },
  "Rúcula": { unit: "paquete", precios: [null, null, 2200, 700], pesoGramos: 100 },
  "Tomate cherry": { unit: "bandeja", precios: [1600, null, 1900, null], pesoGramos: 500 },
  "Tomate perita": { unit: "kg", precios: [null, null, 2500, 3000], pesoGramos: 1000 },
  "Zanahoria": { unit: "kg", precios: [2500, null, 2900, 2500], pesoGramos: 1000 },
  "Zapallo anco": { unit: "unidad", precios: [1900, null, null, null], pesoGramos: 2000 },
  "Zucchini": { unit: "kg", precios: [4900, null, null, 4500], pesoGramos: 1000 },
  "Ananá": { unit: "unidad", precios: [null, 6500, null, 7000], pesoGramos: 1200 },
  "Banana": { unit: "kg", precios: [3350, null, 3900, 3000], pesoGramos: 1000 },
  "Kiwi": { unit: "bandeja", precios: [7000, null, 4900, null], pesoGramos: 500 },
  "Limón": { unit: "kg", precios: [4400, null, 2200, 1300], pesoGramos: 1000 },
  "Mandarina": { unit: "kg", precios: [1800, null, 2900, 1300], pesoGramos: 1000 },
  "Manzana verde": { unit: "kg", precios: [6300, 7000, 7600, 5500], pesoGramos: 1000 },
  "Manzana roja": { unit: "kg", precios: [6900, null, 7600, 5500], pesoGramos: 1000 },
  "Naranja para jugo": { unit: "kg", precios: [null, null, 3500, 2000], pesoGramos: 1000 },
  "Palta Hass": { unit: "unidad", precios: [2600, null, null, 1500], pesoGramos: 200 },
  "Pera Williams": { unit: "kg", precios: [null, null, 4500, 4999], pesoGramos: 1000 },
  "Frutilla": { unit: "bandeja", precios: [null, null, null, 4900], pesoGramos: 500 },
  "Champiñones frescos": { unit: "bandeja", precios: [null, null, 8400, 6550], pesoGramos: 200 },
  "Portobellos frescos": { unit: "bandeja", precios: [null, null, 8700, 6550], pesoGramos: 200 },
  "Huevos blancos": { unit: "docena", precios: [4000, null, null, 3000], pesoGramos: null },
  "Ajo": { unit: "unidad", precios: [null, null, 2500, null], pesoGramos: null },
  "Jengibre": { unit: "kg", precios: [null, null, 5500, 12000], pesoGramos: 250 },
  "Albahaca": { unit: "atado", precios: [null, null, null, 2000], pesoGramos: null },
  "Ciboulette": { unit: "atado", precios: [null, 4000, null, 3000], pesoGramos: null },
};

export type Stats = {
  mn: number | null;
  mx: number | null;
  avg: number | null;
  spreadPct: number | null;
};

export function statsOf(precios: (number | null)[]): Stats {
  const def = precios.filter((x): x is number => x !== null);
  if (!def.length) return { mn: null, mx: null, avg: null, spreadPct: null };
  const mn = Math.min(...def);
  const mx = Math.max(...def);
  const avg = def.reduce((a, b) => a + b, 0) / def.length;
  const spreadPct = def.length > 1 ? Math.round(((mx - mn) / mn) * 100) : null;
  return { mn, mx, avg, spreadPct };
}
