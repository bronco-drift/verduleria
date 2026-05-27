import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductCard } from "@/components/storefront/product-card";

export default async function TiendaCatalogoPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, sort_order")
      .eq("store_id", store.id)
      .order("sort_order"),
    supabase
      .from("products")
      .select("id, name, price, unit_amount, category_id, is_featured")
      .eq("store_id", store.id)
      .eq("is_active", true)
      .order("name"),
  ]);

  if (!products || products.length === 0) {
    return (
      <p className="text-muted-foreground">
        Esta verdulería todavía no cargó productos.
      </p>
    );
  }

  const byCategory = new Map<string | null, typeof products>();
  for (const p of products) {
    const key = p.category_id ?? null;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }

  return (
    <div className="space-y-12">
      {(categories ?? []).map((cat) => {
        const items = byCategory.get(cat.id) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={cat.id}>
            <h3 className="text-lg font-semibold mb-4">{cat.name}</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
