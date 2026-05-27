import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { ProductForm } from "./product-form";
import { ProductsTable } from "./products-table";

export default async function VerduleriaProductosPage() {
  const store = await getDemoStore();
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

  const list = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    cost: Number(p.cost ?? 0),
    stock: p.stock ?? 0,
    stock_min: p.stock_min ?? 5,
    unit: p.unit,
    unit_amount: p.unit_amount,
    is_active: p.is_active,
    is_featured: p.is_featured,
    category_id: p.category_id,
  }));

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        {list.length} productos cargados.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <ProductsTable products={list} categories={categories ?? []} />

        <aside>
          <Card className="p-4 space-y-3 sticky top-4">
            <h3 className="text-[13px] font-bold">Nuevo producto</h3>
            <ProductForm categories={categories ?? []} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
