import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { TIENDAS_REFERENCIA } from "@/lib/data/tiendas-mapa";
import { MapView } from "./map-view";

export default async function CercaPage() {
  const supabase = createSupabaseAdminClient();

  // Bring in OUR own stores too (the ones in DB). They are plotted only if
  // they have lat/lng; otherwise omitted.
  const { data: ownStores } = await supabase
    .from("stores")
    .select("id, slug, name, address, phone, lat, lng")
    .eq("is_active", true);

  const ownPlotted = (ownStores ?? [])
    .filter((s) => s.lat !== null && s.lng !== null)
    .map((s) => ({
      id: `own-${s.slug}`,
      nombre: s.name,
      color: "#1a6630",
      direccion: s.address ?? "",
      zona: "Tu verdulería",
      lat: Number(s.lat),
      lng: Number(s.lng),
      tel: s.phone ?? "-",
      entrega: "Coordinar",
    }));

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[15px] font-bold mb-1">
          📍 Encontrá la verdulería más cercana
        </h2>
        <p className="text-xs text-muted-foreground">
          Configurá tu dirección o usá tu ubicación actual para ver qué
          verdulería tenés más cerca.
        </p>
      </div>
      <MapView stores={[...ownPlotted, ...TIENDAS_REFERENCIA]} />
    </div>
  );
}
