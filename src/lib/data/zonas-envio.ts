export type Zona = {
  id: string;
  nombre: string;
  costoFijo: number;
  freeMin: number;
  tiempoMin: number;
  tiempoMax: number;
};

export const ZONAS_ENVIO: Zona[] = [
  { id: "caba-centro", nombre: "CABA Centro", costoFijo: 1500, freeMin: 8000, tiempoMin: 30, tiempoMax: 60 },
  { id: "caba-ns", nombre: "CABA Norte/Sur", costoFijo: 2200, freeMin: 12000, tiempoMin: 45, tiempoMax: 90 },
  { id: "gba-1", nombre: "GBA Zona 1", costoFijo: 3500, freeMin: 18000, tiempoMin: 60, tiempoMax: 120 },
  { id: "gba-2", nombre: "GBA Zona 2", costoFijo: 5000, freeMin: 25000, tiempoMin: 90, tiempoMax: 180 },
];
