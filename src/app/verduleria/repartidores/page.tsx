import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { AddDriverForm } from "./add-driver-form";
import { DriverRow } from "./driver-row";

export default async function VerduleriaRepartidoresPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: drivers } = await supabase
    .from("store_members")
    .select(`user_id, profiles(full_name, phone)`)
    .eq("store_id", store.id)
    .eq("role", "driver");

  type Row = {
    user_id: string;
    profiles: { full_name: string | null; phone: string | null } | null;
  };

  const list = ((drivers ?? []) as unknown as Row[]).map((d) => ({
    userId: d.user_id,
    name: d.profiles?.full_name ?? `(${d.user_id.slice(0, 8)})`,
    phone: d.profiles?.phone,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{list.length} cargados.</p>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {list.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Todavía no hay repartidores. Agregá el primero desde el panel de
              la derecha.
            </Card>
          ) : (
            <Card className="divide-y p-0">
              {list.map((d) => (
                <DriverRow
                  key={d.userId}
                  userId={d.userId}
                  name={d.name}
                  phone={d.phone ?? null}
                />
              ))}
            </Card>
          )}
        </div>

        <aside>
          <Card className="p-4 space-y-3 sticky top-4">
            <h3 className="font-semibold">Nuevo repartidor</h3>
            <AddDriverForm />
          </Card>
        </aside>
      </div>
    </div>
  );
}
