import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CategoryFilters } from "./category-filters";
import { ProductCard } from "./product-card";

type SP = Promise<{ cat?: string; q?: string }>;

export default async function TiendaCatalogoPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { cat, q } = await searchParams;
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("store_id", store.id)
      .order("sort_order"),
    supabase
      .from("products")
      .select(
        "id, name, price, unit, unit_amount, category_id, is_featured, stock, stock_min"
      )
      .eq("store_id", store.id)
      .eq("is_active", true)
      .order("name"),
  ]);

  const filtered = (products ?? []).filter((p) => {
    if (cat && cat !== "Todas") {
      const catName = categories?.find((c) => c.id === p.category_id)?.name;
      if (catName !== cat) return false;
    }
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <CategoryFilters
        categories={["Todas", ...(categories?.map((c) => c.name) ?? [])]}
        activeCat={cat ?? "Todas"}
        activeQ={q ?? ""}
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">
          Sin productos.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductCard
                product={{
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  unit: p.unit,
                  unit_amount: p.unit_amount,
                  stock: p.stock ?? 0,
                  stock_min: p.stock_min ?? 0,
                  is_featured: p.is_featured,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
