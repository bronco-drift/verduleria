import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ESTACIONALIDAD_DEFAULT, MESES_ALL } from "@/lib/data/estacionalidad";
import { SeasonalityGrid } from "./seasonality-grid";

export default async function EstacionalidadPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("store_id", store.id)
    .order("name");

  const rows = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    meses: ESTACIONALIDAD_DEFAULT[p.name] ?? MESES_ALL,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-bold mb-1">Estacionalidad</h2>
        <p className="text-xs text-muted-foreground">
          Marcá los meses en que cada producto está disponible. Mes actual
          resaltado en azul. (Los cambios son locales — no se guardan a la DB
          todavía).
        </p>
      </div>
      <SeasonalityGrid products={rows} />
    </div>
  );
}
