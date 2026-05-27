/**
 * Recipe combos that the customer can add to the cart in one click.
 * Quantities scale by the number of "personas" using one of:
 *   - lineal: cant * personas
 *   - sublineal: cant * personas^0.85 (rinde más por persona)
 *   - fijo: cant * 2 (no escala con personas)
 *
 * Ingredient names must match a product name in the catalog or the combo
 * shows it as "no disponible".
 */

export type Factor = "lineal" | "sublineal" | "fijo";

export type Ingrediente = {
  /** Must match a product name in the catalog (or close enough). */
  n: string;
  cantPorPersona: number;
  unidad: string;
  factor: Factor;
};

export type Receta = {
  id: string;
  emoji: string;
  nombre: string;
  desc: string;
  veg: boolean;
  tiempo: string;
  dificultad: "Fácil" | "Media" | "Difícil";
  ing: Ingrediente[];
  prep: string[];
};

export const RECETAS: Receta[] = [
  {
    id: "tarta",
    emoji: "🥧",
    nombre: "Tarta de acelga",
    desc: "Tarta clásica con acelga, cebolla y huevo.",
    veg: true, tiempo: "50 min", dificultad: "Fácil",
    ing: [
      { n: "Acelga fresca", cantPorPersona: 1, unidad: "atado", factor: "sublineal" },
      { n: "Cebolla", cantPorPersona: 0.25, unidad: "kg", factor: "lineal" },
      { n: "Huevos blancos", cantPorPersona: 1, unidad: "unidad", factor: "lineal" },
    ],
    prep: [
      "Salteá la cebolla picada hasta dorarla.",
      "Herví la acelga 5 min, escurrila y picala.",
      "Mezclá acelga, cebolla y huevos batidos. Salpimentá.",
      "Volcá sobre masa de tarta y horneá 30 min a 180°C.",
    ],
  },
  {
    id: "sopa",
    emoji: "🥣",
    nombre: "Sopa de verduras",
    desc: "Sopa nutritiva con verduras de estación.",
    veg: true, tiempo: "45 min", dificultad: "Fácil",
    ing: [
      { n: "Zanahoria", cantPorPersona: 0.2, unidad: "kg", factor: "lineal" },
      { n: "Cebolla", cantPorPersona: 0.15, unidad: "kg", factor: "sublineal" },
      { n: "Apio", cantPorPersona: 0.25, unidad: "unidad", factor: "sublineal" },
    ],
    prep: [
      "Picá todas las verduras en cubos chicos.",
      "Salteá cebolla y apio en una olla con aceite.",
      "Cubrí con caldo o agua y herví 25 min.",
      "Procesar opcional para crema, o dejar entero.",
    ],
  },
  {
    id: "gramajo",
    emoji: "🍳",
    nombre: "Revuelto Gramajo",
    desc: "Plato porteño con papas pay, jamón y huevos revueltos.",
    veg: false, tiempo: "30 min", dificultad: "Fácil",
    ing: [
      { n: "Huevos blancos", cantPorPersona: 2, unidad: "unidad", factor: "lineal" },
      { n: "Cebolla", cantPorPersona: 0.1, unidad: "kg", factor: "sublineal" },
    ],
    prep: [
      "Cortá las papas en bastones finos y freílas hasta dorar.",
      "Picá la cebolla y dorala con jamón cortado.",
      "Batí los huevos apenas y volcalos sobre la cebolla.",
      "Cuando cuajen, mezclá con las papas y servir.",
    ],
  },
  {
    id: "wok",
    emoji: "🥢",
    nombre: "Wok de verduras",
    desc: "Salteado oriental rápido con verduras crocantes.",
    veg: true, tiempo: "20 min", dificultad: "Fácil",
    ing: [
      { n: "Zanahoria", cantPorPersona: 0.15, unidad: "kg", factor: "lineal" },
      { n: "Morrón rojo", cantPorPersona: 0.5, unidad: "unidad", factor: "lineal" },
      { n: "Zucchini", cantPorPersona: 0.2, unidad: "kg", factor: "lineal" },
      { n: "Champiñones frescos", cantPorPersona: 0.5, unidad: "bandeja", factor: "lineal" },
    ],
    prep: [
      "Cortá todas las verduras en juliana fina.",
      "Calentá el wok bien caliente con aceite de sésamo.",
      "Salteá zanahoria primero, luego las blandas.",
      "Terminá con salsa de soja y servir inmediato.",
    ],
  },
  {
    id: "caprese",
    emoji: "🍅",
    nombre: "Ensalada Caprese",
    desc: "Tomates, muzzarella y albahaca. Italiana clásica.",
    veg: true, tiempo: "10 min", dificultad: "Fácil",
    ing: [
      { n: "Tomate cherry", cantPorPersona: 0.5, unidad: "bandeja", factor: "lineal" },
      { n: "Albahaca", cantPorPersona: 0.25, unidad: "atado", factor: "sublineal" },
    ],
    prep: [
      "Cortá tomates al medio y muzzarella en rodajas.",
      "Disponé en plato alternando colores.",
      "Rociá con aceite de oliva y vinagre.",
      "Terminá con hojas de albahaca y sal gruesa.",
    ],
  },
  {
    id: "tortilla",
    emoji: "🥔",
    nombre: "Tortilla española",
    desc: "Tortilla de papa y huevo. Súper rendidora.",
    veg: true, tiempo: "35 min", dificultad: "Media",
    ing: [
      { n: "Huevos blancos", cantPorPersona: 2, unidad: "unidad", factor: "lineal" },
      { n: "Cebolla", cantPorPersona: 0.15, unidad: "kg", factor: "sublineal" },
      { n: "Papa cepillada", cantPorPersona: 0.5, unidad: "paquete", factor: "sublineal" },
    ],
    prep: [
      "Pelá y cortá papas en rodajas finas.",
      "Freílas con cebolla a fuego bajo 20 min.",
      "Mezclá con huevos batidos y sal.",
      "Cuajá en sartén 4 min por lado dándola vuelta.",
    ],
  },
  {
    id: "risotto",
    emoji: "🍚",
    nombre: "Risotto de hongos",
    desc: "Arroz cremoso con portobello y champiñones.",
    veg: true, tiempo: "40 min", dificultad: "Media",
    ing: [
      { n: "Portobellos frescos", cantPorPersona: 0.5, unidad: "bandeja", factor: "lineal" },
      { n: "Champiñones frescos", cantPorPersona: 0.5, unidad: "bandeja", factor: "lineal" },
      { n: "Cebolla", cantPorPersona: 0.15, unidad: "kg", factor: "sublineal" },
    ],
    prep: [
      "Picá cebolla fina y salteá en olla con manteca.",
      "Agregá arroz arborio, tostar 2 min, deglasar con vino.",
      "Sumá caldo caliente de a poco, revolviendo.",
      "Saltear hongos aparte y mezclar al final con parmesano.",
    ],
  },
  {
    id: "pasta",
    emoji: "🍝",
    nombre: "Pasta con salsa fresca",
    desc: "Fideos con salsa de tomate cherry, ajo y albahaca.",
    veg: true, tiempo: "25 min", dificultad: "Fácil",
    ing: [
      { n: "Tomate cherry", cantPorPersona: 0.5, unidad: "bandeja", factor: "lineal" },
      { n: "Cebolla", cantPorPersona: 0.1, unidad: "kg", factor: "sublineal" },
      { n: "Ajo", cantPorPersona: 0.2, unidad: "unidad", factor: "sublineal" },
      { n: "Albahaca", cantPorPersona: 0.2, unidad: "atado", factor: "sublineal" },
    ],
    prep: [
      "Cortar tomates cherry al medio.",
      "Saltear cebolla y ajo picado en aceite de oliva.",
      "Sumar tomates y cocinar 10 min hasta que se rompan.",
      "Mezclar con pasta cocida al dente y queso rallado.",
    ],
  },
  {
    id: "buddhabowl",
    emoji: "🥗",
    nombre: "Buddha Bowl",
    desc: "Bowl saludable con palta, vegetales y rúcula.",
    veg: true, tiempo: "30 min", dificultad: "Fácil",
    ing: [
      { n: "Palta Hass", cantPorPersona: 0.5, unidad: "unidad", factor: "lineal" },
      { n: "Zanahoria", cantPorPersona: 0.1, unidad: "kg", factor: "lineal" },
      { n: "Rúcula", cantPorPersona: 0.5, unidad: "paquete", factor: "lineal" },
      { n: "Limón", cantPorPersona: 0.1, unidad: "kg", factor: "sublineal" },
    ],
    prep: [
      "Cocinar quinoa con doble cantidad de agua, 15 min.",
      "Cortar palta y zanahoria rallada.",
      "Armar bowl con base de rúcula, quinoa al centro y vegetales alrededor.",
      "Aderezar con limón, aceite de oliva y sal.",
    ],
  },
  {
    id: "empanadas",
    emoji: "🥟",
    nombre: "Empanadas de verdura",
    desc: "Empanadas con espinaca, acelga y queso.",
    veg: true, tiempo: "60 min", dificultad: "Media",
    ing: [
      { n: "Espinaca", cantPorPersona: 1, unidad: "atado", factor: "sublineal" },
      { n: "Acelga fresca", cantPorPersona: 0.5, unidad: "atado", factor: "sublineal" },
      { n: "Cebolla", cantPorPersona: 0.1, unidad: "kg", factor: "sublineal" },
      { n: "Huevos blancos", cantPorPersona: 0.5, unidad: "unidad", factor: "sublineal" },
    ],
    prep: [
      "Hervir espinaca y acelga, escurrir bien y picar.",
      "Saltear cebolla y mezclar con verduras.",
      "Sumar huevo duro picado, queso rallado y condimentar.",
      "Rellenar tapas, hacer repulgue y hornear 20 min a 200°C.",
    ],
  },
  {
    id: "frittata",
    emoji: "🍳",
    nombre: "Frittata de verduras",
    desc: "Tortilla horneada con huevos, espinaca y morrones.",
    veg: true, tiempo: "35 min", dificultad: "Fácil",
    ing: [
      { n: "Huevos blancos", cantPorPersona: 2, unidad: "unidad", factor: "lineal" },
      { n: "Espinaca", cantPorPersona: 0.5, unidad: "atado", factor: "sublineal" },
      { n: "Morrón rojo", cantPorPersona: 0.5, unidad: "unidad", factor: "lineal" },
      { n: "Cebolla", cantPorPersona: 0.1, unidad: "kg", factor: "sublineal" },
    ],
    prep: [
      "Saltear cebolla y morrón en sartén apta para horno.",
      "Agregar espinaca y cocinar hasta reducir.",
      "Batir huevos con queso rallado y volcar sobre vegetales.",
      "Cocinar 3 min en hornalla y terminar 10 min en horno fuerte.",
    ],
  },
  {
    id: "smoothie",
    emoji: "🍌",
    nombre: "Smoothie Bowl",
    desc: "Desayuno energético con banana, frutilla y kiwi.",
    veg: true, tiempo: "10 min", dificultad: "Fácil",
    ing: [
      { n: "Banana", cantPorPersona: 0.25, unidad: "kg", factor: "lineal" },
      { n: "Kiwi", cantPorPersona: 0.25, unidad: "bandeja", factor: "lineal" },
      { n: "Frutilla", cantPorPersona: 0.25, unidad: "bandeja", factor: "lineal" },
    ],
    prep: [
      "Congelar bananas la noche anterior.",
      "Procesar bananas congeladas con yogur.",
      "Servir en bowl y decorar con kiwi y frutilla en rodajas.",
      "Terminar con granola, semillas y miel.",
    ],
  },
];

export function escalar(cant: number, personas: number, factor: Factor): number {
  if (factor === "lineal") return cant * personas;
  if (factor === "fijo") return cant * 2;
  return cant * Math.pow(personas, 0.85);
}
