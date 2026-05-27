import { requireAdminContext } from "@/lib/admin/auth";
import { Card } from "@/components/ui/card";
import { ProductForm } from "./product-form";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage() {
  const ctx = await requireAdminContext();

  const [{ data: products }, { data: categories }] = await Promise.all([
    ctx.admin
      .from("products")
      .select("id, name, price, unit, unit_amount, is_active, is_featured, category_id")
      .eq("store_id", ctx.store.id)
      .order("name"),
    ctx.admin
      .from("categories")
      .select("id, name")
      .eq("store_id", ctx.store.id)
      .order("sort_order"),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">
          {products?.length ?? 0} cargados.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ProductsTable
          products={products ?? []}
          categories={categories ?? []}
        />

        <aside>
          <Card className="p-4 space-y-4 sticky top-4">
            <h2 className="font-semibold">Nuevo producto</h2>
            <ProductForm categories={categories ?? []} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
