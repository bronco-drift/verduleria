import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RECETAS } from "@/lib/data/recetas";
import { RecipesPanel } from "./recipes-panel";

export default async function RecetasPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, unit, unit_amount, stock, is_active")
    .eq("store_id", store.id);

  const byName = new Map(
    (products ?? [])
      .filter((p) => p.is_active)
      .map((p) => [
        p.name,
        {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          unit: p.unit,
          unit_amount: p.unit_amount,
          stock: p.stock ?? 0,
        },
      ])
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold mb-1">👨‍🍳 Combos por receta</h2>
        <p className="text-xs text-muted-foreground">
          Elegí una receta y cantidad de personas. Te armamos el combo de
          verduras necesarias y lo agregás al carrito con un click.
        </p>
      </div>
      <RecipesPanel
        recipes={RECETAS}
        productByName={Object.fromEntries(byName)}
      />
    </div>
  );
}
