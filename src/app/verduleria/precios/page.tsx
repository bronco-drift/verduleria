import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PreciosTabs } from "./precios-tabs";

export default async function PreciosPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, unit, unit_amount, price, cost, category_id, categories(name)")
    .eq("store_id", store.id)
    .order("name");

  type Row = {
    id: string;
    name: string;
    unit: string;
    unit_amount: string | null;
    price: number;
    cost: number;
    category: string;
  };

  const list: Row[] = (products ?? []).map((p) => {
    const cat = Array.isArray(p.categories)
      ? (p.categories[0] as { name: string } | undefined)?.name ?? "Sin categoría"
      : (p.categories as { name: string } | null)?.name ?? "Sin categoría";
    return {
      id: p.id,
      name: p.name,
      unit: p.unit,
      unit_amount: p.unit_amount,
      price: Number(p.price),
      cost: Number(p.cost ?? 0),
      category: cat,
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold mb-1">Precios y márgenes</h2>
        <p className="text-xs text-muted-foreground">
          Compará tus precios contra la competencia y ajustá márgenes.
        </p>
      </div>
      <PreciosTabs products={list} />
    </div>
  );
}
