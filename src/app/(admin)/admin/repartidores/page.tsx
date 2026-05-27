import { requireAdminContext } from "@/lib/admin/auth";
import { Card } from "@/components/ui/card";
import { AddDriverForm } from "./add-driver-form";
import { DriverRow } from "./driver-row";

export default async function AdminDriversPage() {
  const ctx = await requireAdminContext();

  const { data: drivers } = await ctx.admin
    .from("store_members")
    .select(`user_id, profiles(full_name, phone)`)
    .eq("store_id", ctx.store.id)
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
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Repartidores</h1>
        <p className="text-sm text-muted-foreground">
          {list.length} cargados.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {list.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Todavía no hay repartidores asignados.
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
            <h2 className="font-semibold">Agregar repartidor</h2>
            <p className="text-xs text-muted-foreground">
              El repartidor tiene que estar registrado en /registro primero.
              Ingresá su email para asignarlo.
            </p>
            <AddDriverForm />
          </Card>
        </aside>
      </div>
    </div>
  );
}
