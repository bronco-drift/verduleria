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
        "id, name, price, unit, unit_amount, is_active, is_featured, category_id"
      )
      .eq("store_id", store.id)
      .order("name"),
    supabase
      .from("categories")
      .select("id, name")
      .eq("store_id", store.id)
      .order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {products?.length ?? 0} productos cargados.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ProductsTable
          products={products ?? []}
          categories={categories ?? []}
        />

        <aside>
          <Card className="p-4 space-y-4 sticky top-4">
            <h3 className="font-semibold">Nuevo producto</h3>
            <ProductForm categories={categories ?? []} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
