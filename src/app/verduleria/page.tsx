import Link from "next/link";
import { getActiveStore } from "@/lib/active-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { StoreInfoForm } from "./store-info-form";

export default async function MiVerduleriaPage() {
  const store = await getActiveStore();
  const supabase = createSupabaseAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: pendingCount },
    { count: todayCount },
    { count: productCount },
    { count: driverCount },
    { count: stockOutCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("created_at", today.toISOString()),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("is_active", true),
    supabase
      .from("store_members")
      .select("user_id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("role", "driver"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("is_active", true)
      .lte("stock", 0),
    supabase
      .from("orders")
      .select("id, status, total, created_at, delivery_address")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div>
            <h2 className="text-[15px] font-bold mb-1">Resumen</h2>
            <p className="text-xs text-muted-foreground">
              Vista rápida de cómo va tu verdulería hoy.
            </p>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat
              label="Pedidos pendientes"
              value={pendingCount ?? 0}
              href="/verduleria/pedidos?status=pending"
              tone={pendingCount && pendingCount > 0 ? "warn" : "ok"}
            />
            <Stat
              label="Pedidos hoy"
              value={todayCount ?? 0}
              href="/verduleria/pedidos"
            />
            <Stat
              label="Sin stock"
              value={stockOutCount ?? 0}
              href="/verduleria/productos"
              tone={stockOutCount && stockOutCount > 0 ? "bad" : "ok"}
            />
            <Stat
              label="Productos activos"
              value={productCount ?? 0}
              href="/verduleria/productos"
            />
            <Stat
              label="Repartidores"
              value={driverCount ?? 0}
              href="/verduleria/repartidores"
            />
          </ul>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Últimos pedidos</h3>
              <Link
                href="/verduleria/pedidos"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todos →
              </Link>
            </div>
            {!recentOrders || recentOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin pedidos todavía.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/verduleria/pedidos/${o.id}`}>
                      <Card className="p-2.5 flex items-center gap-2.5 hover:border-foreground">
                        <span className="font-mono text-[10px] text-muted-foreground w-16">
                          #{o.id.slice(0, 8)}
                        </span>
                        <OrderStatusBadge status={o.status} />
                        <span className="text-xs truncate flex-1">
                          {o.delivery_address}
                        </span>
                        <span className="text-xs font-bold tabular-nums">
                          ${Number(o.total).toLocaleString("es-AR")}
                        </span>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside>
          <Card className="p-4 space-y-3 sticky top-4">
            <header>
              <h3 className="text-sm font-bold">Información y configuración</h3>
              <p className="text-[11px] text-muted-foreground">
                Editá los datos de tu verdulería. Se reflejan en la tienda y en
                el cálculo de envío.
              </p>
            </header>
            <StoreInfoForm
              storeId={store.id}
              defaults={{
                name: store.name,
                address: store.address ?? "",
                phone: store.phone ?? "",
                delivery_fee: Number(store.delivery_fee),
              }}
            />
            <div className="pt-3 border-t text-[11px] text-muted-foreground space-y-1">
              <p>
                Slug: <span className="font-mono">/{store.slug}</span>
              </p>
              <p>
                ID: <span className="font-mono text-[10px]">{store.id}</span>
              </p>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  tone = "neu",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "ok" | "warn" | "bad" | "neu";
}) {
  const color =
    tone === "ok"
      ? "text-[var(--success)]"
      : tone === "warn"
        ? "text-[var(--warning)]"
        : tone === "bad"
          ? "text-[var(--destructive)]"
          : "";
  return (
    <li>
      <Link href={href}>
        <Card className="p-3.5 hover:border-foreground">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
        </Card>
      </Link>
    </li>
  );
}
