import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const STORE_SLUG = "don-jose";

type SeedProduct = {
  name: string;
  price: string;
  unit:
    | "kg"
    | "g"
    | "unidad"
    | "atado"
    | "bandeja"
    | "paquete"
    | "docena"
    | "litro"
    | "ml";
  unit_amount?: string;
  category: string;
  is_featured?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  // Verduras
  { name: "Acelga fresca", price: "1900", unit: "atado", unit_amount: "1 atado", category: "Verduras" },
  { name: "Espinaca", price: "1900", unit: "atado", unit_amount: "1 atado", category: "Verduras" },
  { name: "Lechuga manteca", price: "1400", unit: "unidad", unit_amount: "1 planta", category: "Verduras" },
  { name: "Rúcula", price: "2200", unit: "paquete", unit_amount: "1 paquete", category: "Verduras", is_featured: true },
  { name: "Tomate perita", price: "3000", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Tomate cherry", price: "1900", unit: "bandeja", unit_amount: "500 g", category: "Verduras", is_featured: true },
  { name: "Cebolla", price: "1600", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Cebolla morada", price: "2200", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Papa cepillada", price: "2300", unit: "paquete", unit_amount: "2 kg", category: "Verduras" },
  { name: "Batata", price: "2500", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Zanahoria", price: "2500", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Morrón rojo", price: "1300", unit: "unidad", unit_amount: "1 u", category: "Verduras" },
  { name: "Morrón verde", price: "900", unit: "unidad", unit_amount: "1 u", category: "Verduras" },
  { name: "Brócoli", price: "2500", unit: "unidad", unit_amount: "1 u", category: "Verduras" },
  { name: "Apio", price: "2000", unit: "unidad", unit_amount: "1 u", category: "Verduras" },
  { name: "Zapallo anco", price: "1900", unit: "unidad", unit_amount: "1 u", category: "Verduras" },
  { name: "Zucchini", price: "4000", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Berenjena", price: "3900", unit: "kg", unit_amount: "1 kg", category: "Verduras" },
  { name: "Choclo", price: "4100", unit: "bandeja", unit_amount: "2 u", category: "Verduras" },

  // Frutas
  { name: "Banana", price: "2900", unit: "kg", unit_amount: "1 kg", category: "Frutas", is_featured: true },
  { name: "Manzana roja", price: "4500", unit: "kg", unit_amount: "1 kg", category: "Frutas" },
  { name: "Manzana verde", price: "4500", unit: "kg", unit_amount: "1 kg", category: "Frutas" },
  { name: "Pera Williams", price: "4500", unit: "kg", unit_amount: "1 kg", category: "Frutas" },
  { name: "Naranja para jugo", price: "2000", unit: "kg", unit_amount: "1 kg", category: "Frutas" },
  { name: "Mandarina", price: "1800", unit: "kg", unit_amount: "1 kg", category: "Frutas" },
  { name: "Limón", price: "2200", unit: "kg", unit_amount: "1 kg", category: "Frutas" },
  { name: "Kiwi", price: "5000", unit: "bandeja", unit_amount: "500 g", category: "Frutas" },
  { name: "Palta Hass", price: "2600", unit: "unidad", unit_amount: "1 u grande", category: "Frutas", is_featured: true },
  { name: "Frutilla", price: "4900", unit: "bandeja", unit_amount: "500 g", category: "Frutas" },
  { name: "Ananá", price: "6500", unit: "unidad", unit_amount: "1 u", category: "Frutas" },

  // Hongos
  { name: "Champiñones frescos", price: "6800", unit: "bandeja", unit_amount: "200 g", category: "Hongos" },
  { name: "Portobellos frescos", price: "8700", unit: "bandeja", unit_amount: "200 g", category: "Hongos" },

  // Hierbas
  { name: "Perejil", price: "1500", unit: "paquete", unit_amount: "1 paquete", category: "Hierbas" },
  { name: "Albahaca", price: "2000", unit: "unidad", unit_amount: "1 atado", category: "Hierbas" },
  { name: "Ciboulette", price: "3000", unit: "atado", unit_amount: "1 atado", category: "Hierbas" },

  // Almacén
  { name: "Huevos blancos", price: "4000", unit: "docena", unit_amount: "12 u", category: "Almacén" },
  { name: "Ajo", price: "2500", unit: "unidad", unit_amount: "2 cabezas", category: "Almacén" },
  { name: "Jengibre", price: "5500", unit: "kg", unit_amount: "250 g", category: "Almacén" },
];

const CATEGORIES = ["Frutas", "Verduras", "Hongos", "Hierbas", "Almacén"];

async function main() {
  console.log("🌱 Seeding Verdulería Don José...\n");

  // 1) Upsert store
  console.log("→ Store...");
  const { data: store, error: storeErr } = await supabase
    .from("stores")
    .upsert(
      {
        slug: STORE_SLUG,
        name: "Verdulería Don José",
        address: "Av. Cabildo 1234, CABA",
        phone: "+54 9 11 5555-1234",
        delivery_fee: "1500",
        is_active: true,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (storeErr || !store) {
    console.error("Store error:", storeErr);
    process.exit(1);
  }
  console.log(`  ✓ ${store.name} (id: ${store.id})`);

  // 2) Wipe existing categories+products for this store (cascade)
  console.log("→ Limpiando categorías y productos previos...");
  await supabase.from("products").delete().eq("store_id", store.id);
  await supabase.from("categories").delete().eq("store_id", store.id);

  // 3) Insert categories
  console.log("→ Categorías...");
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .insert(
      CATEGORIES.map((name, i) => ({
        store_id: store.id,
        name,
        sort_order: i,
      }))
    )
    .select();

  if (catErr || !cats) {
    console.error("Categories error:", catErr);
    process.exit(1);
  }
  console.log(`  ✓ ${cats.length} categorías`);

  const catByName = new Map(cats.map((c) => [c.name, c.id]));

  // 4) Insert products
  console.log("→ Productos...");
  const productRows = PRODUCTS.map((p) => ({
    store_id: store.id,
    category_id: catByName.get(p.category) ?? null,
    name: p.name,
    price: p.price,
    unit: p.unit,
    unit_amount: p.unit_amount,
    is_featured: p.is_featured ?? false,
    is_active: true,
  }));

  const { data: prods, error: prodErr } = await supabase
    .from("products")
    .insert(productRows)
    .select();

  if (prodErr || !prods) {
    console.error("Products error:", prodErr);
    process.exit(1);
  }
  console.log(`  ✓ ${prods.length} productos\n`);

  console.log("✅ Seed completo.");
  console.log(`   Storefront: /don-jose`);
  console.log(`   Store ID:   ${store.id}\n`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
