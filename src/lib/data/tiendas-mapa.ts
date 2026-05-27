/**
 * Reference stores used by the "Cerca de mí" tab.
 * These are the 4 known competitors plotted on the map alongside YOUR own
 * stores (which come from the DB).
 */
export type TiendaMapa = {
  id: string;
  nombre: string;
  color: string;
  direccion: string;
  zona: string;
  lat: number;
  lng: number;
  tel: string;
  entrega: string;
};

export const TIENDAS_REFERENCIA: TiendaMapa[] = [
  {
    id: "barata",
    nombre: "La Barata Shop",
    color: "#e24b4a",
    direccion: "Palermo, CABA",
    zona: "CABA",
    lat: -34.578,
    lng: -58.43,
    tel: "+54 9 11 4192-0076",
    entrega: "Todos los días",
  },
  {
    id: "verde",
    nombre: "Verde Puro",
    color: "#1d9e75",
    direccion: "Zona Norte, GBA",
    zona: "Zona Norte",
    lat: -34.4708,
    lng: -58.523,
    tel: "+54 11 2669-1368",
    entrega: "Lun a Vie",
  },
  {
    id: "click",
    nombre: "El Click Bolsones",
    color: "#7f77dd",
    direccion: "CABA y AMBA",
    zona: "CABA + AMBA",
    lat: -34.6118,
    lng: -58.4173,
    tel: "-",
    entrega: "Lun a Vie",
  },
  {
    id: "nico",
    nombre: "Verdulería de Nico",
    color: "#ef9f27",
    direccion: "Zona Norte, GBA",
    zona: "Zona Norte",
    lat: -34.49,
    lng: -58.5,
    tel: "-",
    entrega: "A coordinar",
  },
];

export const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // CABA centro

export function distKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
