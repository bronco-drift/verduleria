import { getActiveStore } from "@/lib/active-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { StockPanel, type StockRow } from "./stock-panel";

export default async function VerduleriaProductosPage() {
  const store = await getActiveStore();
  const supabase = createSupabaseAdminClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, price, cost, stock, stock_min, unit, unit_amount, is_active, is_featured, category_id"
      )
      .eq("store_id", store.id)
      .order("name"),
    supabase
      .from("categories")
      .select("id, name")
      .eq("store_id", store.id)
      .order("sort_order"),
  ]);

  const catById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const rows: StockRow[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category_id ? catById.get(p.category_id) ?? "Sin categoría" : "Sin categoría",
    unit: p.unit,
    unit_amount: p.unit_amount,
    price: Number(p.price),
    cost: Number(p.cost ?? 0),
    stock: p.stock ?? 0,
    stock_min: p.stock_min ?? 5,
    is_active: p.is_active,
    is_featured: p.is_featured,
  }));

  const allCategories = ["Todas", ...Array.from(new Set(rows.map((r) => r.category)))];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-bold mb-1">📦 Gestión de precios y stock</h2>
        <p className="text-xs text-muted-foreground">
          Activá/desactivá productos, ajustá precios y costos, y controlá el
          stock. Los cambios se reflejan en tiempo real en la Tienda.
        </p>
      </div>
      <StockPanel rows={rows} categories={allCategories} />
    </div>
  );
}
