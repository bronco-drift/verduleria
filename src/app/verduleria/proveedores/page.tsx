import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PROVEEDOR_DEFAULT } from "@/lib/data/proveedores";
import { SuppliersTable } from "./suppliers-table";

export default async function ProveedoresPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, unit, cost")
    .eq("store_id", store.id)
    .order("name");

  const rows = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    cost: Number(p.cost ?? 0),
    proveedor: PROVEEDOR_DEFAULT[p.name] ?? "Mercado Central",
    ultimaActualizacion: "2026-05-20",
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-bold mb-1">Proveedores</h2>
        <p className="text-xs text-muted-foreground">
          Asignación de proveedor por producto + control de cuándo actualizaste
          el costo. Rojo = más de 14 días sin tocar el costo.
        </p>
      </div>
      <SuppliersTable rows={rows} />
    </div>
  );
}
